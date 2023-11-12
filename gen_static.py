import pandas as pd
import folium
import webbrowser

station_coord = pd.read_excel("./data/STATION_COORDS_HACKATON.xlsx")
peregon = pd.read_excel("./data/PEREGON_HACKATON1.xlsx")


station_coord_cleaned = station_coord.dropna()


m = folium.Map(tiles="Cartodb dark_matter",location=[station_coord_cleaned['LATITUDE'].mean(), station_coord_cleaned['LONGITUDE'].mean()], zoom_start=5)
# Добавляем статичные маркеры (CircleMarker) для каждого объекта
for index, row in station_coord_cleaned.iterrows():
    folium.CircleMarker(location=[row['LATITUDE'], row['LONGITUDE']],
                        radius=2,  # радиус круга (можно настроить)
                        color='white',  # цвет круга
                        fill=True,
                        fill_color='white',  # цвет заливки
                        fill_opacity=0.7,  # прозрачность заливки
                        popup=row['ST_ID']).add_to(m)
# Добавляем линии между соответствующими вершинами

for index, row in peregon.iterrows():
    start_station = station_coord_cleaned.loc[station_coord_cleaned['ST_ID'] == row['START_CODE']]
    end_station = station_coord_cleaned.loc[station_coord_cleaned['ST_ID'] == row['END_CODE']]
    
    if not start_station.empty and not end_station.empty:
        start_coords = [start_station['LATITUDE'].values[0], start_station['LONGITUDE'].values[0]]
        end_coords = [end_station['LATITUDE'].values[0], end_station['LONGITUDE'].values[0]]
        
        folium.PolyLine(locations=[start_coords, end_coords], color='white', weight=2, opacity=0.7).add_to(m)

# m.get_root().html.add_child(folium.JavascriptLink('wagon.js'))
with open('./wagon.js') as file:
    js = file.read()
    print(js)
m.get_root().script.add_child(folium.Element(js))


m.save('static/base_map.html')

webbrowser.open_new_tab('static/base_map.html')# открываем полученную карту в браузере
