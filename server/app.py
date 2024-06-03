import joblib
from datetime import datetime
import holidays
import pandas as pd
import networkx as nx
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

model=joblib.load('RandomForestRegressor.pkl')

def get_day(date):
    # Convert the input date string to a datetime object
    given_date = datetime.strptime(date, '%d/%m/%Y')
    # # Use isoweekday() to get the weekday (Sunday is 1 and Saturday is 7)
    day_of_week = (given_date.weekday() + 1) % 7 +1
    return  day_of_week

def is_weekend(day):
        day=int(day)
        return 1 if day in [1, 7] else 0

def time_to_minutes(time_str):
    hours, minutes = map(int, time_str.split(':'))
    return hours * 60 + minutes

def minDistance(dist, sptSet):
    min_dist = float('inf')
    min_index = -1
    for v in dist:
        if dist[v] < min_dist and not sptSet[v]:
            min_dist = dist[v]
            min_index = v
    return min_index

def create_directed_graph_from_csv(df, weight):
    # Create a directed graph
    DG = nx.DiGraph(directed=True)

    # Group DataFrame by 'Start' and 'End' nodes and find the minimum edge based on the selected weight
    grouped = df.groupby(['Start', 'End'])
    for (start, end), group_df in grouped:
        # print(group_df.loc[group_df[weight].idxmin()])
        min_edge = group_df.loc[group_df[weight].idxmin()]
        DG.add_edge(start, end, Type=min_edge['Type'], 
                    time=min_edge['time'], pollution=min_edge['pollution'])

    return DG

def dijkstra(graph, src, target, weight_value):
    dist = {node: float('inf') for node in graph.nodes}
    dist[src] = 0
    sptSet = {node: False for node in graph.nodes}
    parent = {}
    for _ in range(len(graph.nodes) - 1):
        u = minDistance(dist, sptSet)
        sptSet[u] = True
        for v in graph.neighbors(u):
            edge_weight = graph.edges[u, v][weight_value]
            if not sptSet[v] and dist[v] > dist[u] + edge_weight:
                dist[v] = dist[u] + edge_weight
                parent[v] = u

    # Reconstruct the shortest path
    shortest_path = [target]
    while target != src:
        target = parent[target]
        shortest_path.append(target)
    shortest_path.reverse()

    # Collect edge details along the shortest path including time, pollution, and Type
    edges_details = []
    total_time = 0
    total_pollution = 0
    for i in range(len(shortest_path) - 1):
        u = shortest_path[i]
        v = shortest_path[i + 1]
        edge_weight = graph.edges[u, v][weight_value]
        edge_data = graph.edges[u, v]
        edge_details = {
            'start': u,
            'end': v,
            'time': edge_data['time'],
            'pollution': edge_data['pollution'],
            'type': edge_data['Type'],
            'weight': edge_weight
        }
        edges_details.append(edge_details)
        total_time += edge_data['time']
        total_pollution += edge_data['pollution']

    return dist[shortest_path[-1]], edges_details, total_time, total_pollution

# Define the combined holidays for North America
north_america_holidays = holidays.CA() + holidays.US() + holidays.MX()
def is_holiday(date_str):
    date_obj = datetime.strptime(date_str, '%d/%m/%Y').date()
    return 1 if date_obj in north_america_holidays else 0

def fit_data_to_model(data):
    data[['date', 'hour']] = data['Date'].str.split(' ', expand=True)
    data.drop(columns=["Date"], inplace=True)
    data['Type'] = data['Type'].replace({'Car': 0, 'Pedestrian': 1})
    data.dropna(inplace=True)
    df = pd.get_dummies(data, columns=['Start', 'End'], prefix=['Start', 'End'], dtype=int)
    # Convert 'Hour' column to total minutes
    df['Hour_minutes'] = df['hour'].apply(lambda x: time_to_minutes(x))
    df['Hour'] = (df['Hour_minutes'] - min_hour) / (max_hour - min_hour)
    df['day'] = df['date'].apply(lambda x: get_day(x))
    df['is_weekend'] = df['day'].apply(lambda x: is_weekend(x))
    df['is_holiday'] = df['date'].apply(lambda x: is_holiday(x))
    df = df.drop(columns=["Hour_minutes", 'hour', 'date'])
    return df

def preprocess(date_input):
    data = pd.read_csv('DATA.csv')
    data[['date', 'hour']]=data['Date'].str.split(' ', expand=True)
    data['Hour_minutes'] = data['hour'].apply(lambda x:time_to_minutes(x))
    global max_hour
    max_hour=data["Hour_minutes"].max()
    global min_hour
    min_hour=data["Hour_minutes"].min()
    global max_time
    max_time=data["Travel time"].max()
    global min_time
    min_time=data["Travel time"].min()

    # Load data
    data = pd.read_csv('all_edges.csv',index_col=0)
    data.reset_index(inplace=True)

    # Clean the DataFrame
    data = data.dropna(subset=['Start', 'End'])
    data=data.drop_duplicates()

    bus_data=data[data['Type']=='Bus']
    # Drop columns 'time' and 'pollution'
    data = data.drop(columns=['time', 'pollution'])

    # Remove rows where 'type' column contains 'Bus'
    data = data[data['Type'] != 'Bus']
    date_obj = datetime.strptime(date_input, '%d-%m-%Y %H:%M')
    date_time_obj = date_obj.strftime('%d/%m/%Y %H:%M')
    data['Date'] = date_time_obj
    new_df = fit_data_to_model(data)
    result=model.predict(new_df)
    new_df['Predicted_Time'] =result
    data['time'] = new_df['Predicted_Time'] * (max_time - min_time) + min_time
    data.drop(columns=['date','hour'],inplace=True)
    data['Type'].replace({0:'Car',1:'Walk'},inplace=True)

    def calculate_pollution(row):
            if row['Type'] == 'Walk':
                return 0
            elif row['Type'] == 'Car':
                return row['time'] * 5 / 100

    data['pollution'] = data.apply(calculate_pollution, axis=1)
    global df_combined
    df_combined = pd.concat([data, bus_data], ignore_index=True)

def calcRoute(date_input,source,target,weight_value):
    directed_graph = create_directed_graph_from_csv(df_combined, weight=weight_value)
    res = dijkstra(directed_graph, source, target, weight_value)
    return res
   
def test():
    # Load the test data
    test = pd.read_excel('FINAL_TEST.xlsx')

    # Initialize columns for results
    test['Fastest'] = None
    test['Greenest'] = None

    # Process each row
    for index, row in test.iterrows():
        date = str(row["Date"])[:-3]
        date_obj = datetime.strptime(date, '%Y-%m-%d %H:%M')
        # Convert to the desired format
        formatted_date = date_obj.strftime('%d-%m-%Y %H:%M')
        #pre process 
        preprocess(formatted_date)
        source = row["Start"]
        target = row["End"]
        
        #Calculate fastest route
        fastest_route = calcRoute(formatted_date, source, target, weight_value="time")
        test.at[index, 'Fastest'] = round(fastest_route[2],2)
        
        #Calculate greenest route
        greenest_route = calcRoute(formatted_date, source, target, weight_value="pollution")
        test.at[index, 'Greenest'] = round(greenest_route[2],2)
        if index == 100: 
            break
    # Save the results back to the test DataFrame
    test.to_excel('FINAL_TEST_RESULTS.xlsx', index=False)

@app.route('/', methods=['POST'])
def get_route():
    data = request.json
    date_input = data['date']
    date_obj = datetime.strptime(date_input, '%m/%d/%Y %H:%M')
    # Convert to the desired format
    formatted_date = date_obj.strftime('%d-%m-%Y %H:%M')
    preprocess(formatted_date)
    source = data['source']
    target = data['target']
    weight_value = data['weight_value']

    #Calculate route
    predicted_route = calcRoute(formatted_date, source, target, weight_value)
    return jsonify(predicted_route)

if __name__ == '__main__':
    # test()
    app.run(debug=True)