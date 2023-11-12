import math
from flask import Flask, request, render_template, abort, Response
import folium
import pandas as pd
from flask_cors import CORS, cross_origin
from geopandas import (
    GeoDataFrame,
    overlay,
)  # Импорт класса GeoDataFrame и функции overlay из модуля geopandas
import osmnx as ox
from shapely.geometry import box
import networkx as nx

app = Flask(__name__)

cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

station_coords = pd.read_excel( "./data/STATION_COORDS_HACKATON.xlsx").dropna()

stations_by_id = {}
for station_id,lon,lat in station_coords.values.tolist():
    stations_by_id[int(station_id)] = [lon,lat]



disl = pd.read_excel("./data/disl_hackaton.xlsx")

peregon = pd.read_excel("./data/PEREGON_HACKATON1.xlsx")



sorted_df = disl.sort_values(by="OPERDATE")

grouped_df = sorted_df.groupby("OPERDATE")
first_data_input = sorted_df.reset_index()

first_data_input["OPERDATE"] = pd.to_datetime(first_data_input["OPERDATE"])

latest_data = (
    first_data_input.sort_values(by="OPERDATE", ascending=False)
    .groupby("WAGNUM")
    .head(1)
)
json_data = peregon.dropna()[['START_CODE', 'END_CODE']].values.tolist()
json_data = [[stations_by_id.get(int(i)) ,stations_by_id.get(int(j))]for i,j in json_data]
# json_data = [[i for i in data] for data in json_data if data[0] and data[1]]
perpared_json_data = []

for i in json_data:
    res = []
    if i[0] and i[0][0] and not math.isnan(i[0][0]) and i[0][1] and not math.isnan(i[0][1]) and i[1] and i[1][0] and not math.isnan(i[1][0]) and i[1][1] and not math.isnan(i[1][1]):
        pass
    else:
        continue
            # res.append(j)
    perpared_json_data.append(i)

# print(json_data)
current_locations = []
for index, row in latest_data.iterrows():
    try:
        if value := station_coords.loc[
            station_coords["ST_ID"] == row["ST_ID_DISL"]
        ].values.tolist()[0]:
            if not isinstance(value[0], list):
                ST_ID, LATITUDE, LONGITUDE = value
                current_locations.append(
                    {
                        "station": {
                            "ST_ID": ST_ID,
                            "LATITUDE": LATITUDE,
                            "LONGITUDE": LONGITUDE,
                        },
                        "wagnum": {
                            "WAGNUM": row["WAGNUM"],
                            "OPERDATE": row["OPERDATE"],
                            "ST_ID_DISL": row["ST_ID_DISL"],
                            "ST_ID_DEST": row["ST_ID_DEST"],
                            "TRAIN_INDEX": row["TRAIN_INDEX"],
                        },
                    }
                )
    except:
        pass






G = nx.Graph()

for index, row in peregon.iterrows():
        G.add_edge(int(row['START_CODE']), int(row['END_CODE']), weight=row['LEN'])


def find_shortest_path(graph, start, end):
        try:
            # Используем алгоритм Дейкстры для поиска кратчайшего пути
            shortest_path = nx.shortest_path(graph, source=start, target=end, weight='weight')
            # Получаем длину кратчайшего пути
            shortest_path_length = nx.shortest_path_length(graph, source=start, target=end, weight='weight')
            
            # Находим два альтернативных пути
            alternative_paths = list(nx.all_shortest_paths(graph, source=start, target=end, weight='weight'))[1:3]
            
            return shortest_path, shortest_path_length, alternative_paths
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None, None, None



@app.errorhandler(404) 
def not_found(_): 
  return Response("{'error_message:'not found!'}", status=404, mimetype='application/json')

@app.route("/api/stations/path")
@cross_origin()
def get_path():
    start_id, end_id = request.args.get('start_station_id',type=int),request.args.get('end_station_id',type=int)
    if start_id not in stations_by_id:
        abort(404)
    if end_id not in stations_by_id:
        abort(404)

    shortest_path, _, _ = find_shortest_path(G, start_id, end_id)
    coordinates_list = [stations_by_id[edge] for edge in shortest_path ]

    return coordinates_list

@app.route("/api/wagnums")
@cross_origin()
def vagnums():
    return current_locations


if __name__ == "__main__":
    app.run()

