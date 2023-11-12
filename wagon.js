fetch(`http://localhost:5000/api/wagnums`)
    .then(res => {
        if (res.ok) {
            return res.json();
        } else {
            throw 'Something went wrong!';
        }
    })
    .then(wagnums => {
        const mapName = Object
            .getOwnPropertyNames(globalThis)
            .filter(property => property.startsWith('map'));

        const groupedWagnums = wagnums.reduce((acc, { station, wagnum }) => {
            wagnum.TRAIN_INDEX;
            if (!acc[wagnum.TRAIN_INDEX]) {
                acc[wagnum.TRAIN_INDEX] = [];
            };
            acc[wagnum.TRAIN_INDEX].push({ station: { ...station }, wagnum: { ...wagnum } });
            return acc;
        }, {});

        Object.getOwnPropertyNames(groupedWagnums)
            .filter(train_index => !train_index.startsWith('-'))
            .map((train_index) => {
                const wagnums = groupedWagnums[train_index];
                const anyWagnum = wagnums[0];
                const splitedTrainIndex = train_index.split('-');

                const trainMarkerColor = '#CACACA';

                const markerHtmlStyles = `
                    background-color: ${trainMarkerColor};
                    width: 3rem;
                    height: 3rem;
                    display: block;
                    left: -1.5rem;
                    top: -1.5rem;
                    position: relative;
                    border-radius: 3rem 3rem 0;
                    transform: rotate(45deg);
                    border: 1px solid #FFFFFF`

                const icon = L.divIcon({
                    className: "my-custom-pin",
                    iconAnchor: [0, 24],
                    labelAnchor: [-6, 0],
                    popupAnchor: [0, -36],
                    html: `<span style="${markerHtmlStyles}" />`
                })

                const trainMarker = L.marker([anyWagnum.station.LATITUDE, anyWagnum.station.LONGITUDE], { icon }).addTo(globalThis[mapName]);

                const buildTrainPath = () => {
                    fetch(`http://localhost:5000/api/stations/path?start_station_id=${anyWagnum.wagnum.ST_ID_DISL}&end_station_id=${splitedTrainIndex[2]}`)
                        .then(res => {
                            if (res.ok) {
                                trainMarker.removeEventListener('click', buildTrainPath);
                                return res.json();
                            } else {
                                throw 'Something went wrong!';
                            }
                        })
                        .then((path) => {
                            const destinationColour = '#EB5525'
                            const markerHtmlStyles = `
                            background-color: ${destinationColour};
                            width: 3rem;
                            height: 3rem;
                            display: block;
                            left: -1.5rem;
                            top: -1.5rem;
                            position: relative;
                            border-radius: 3rem 3rem 0;
                            transform: rotate(45deg);
                            border: 1px solid #FFFFFF`

                            const icon = L.divIcon({
                                className: "my-custom-pin",
                                iconAnchor: [0, 24],
                                labelAnchor: [-6, 0],
                                popupAnchor: [0, -36],
                                html: `<span style="${markerHtmlStyles}" />`
                            })


                            const edges = L.polyline(path, { color: '#EB5525' });
                            edges.addTo(globalThis[mapName]);


                            const destinationMarker = L.marker([path[path.length - 1][0], path[path.length - 1][1]], { icon }).addTo(globalThis[mapName]);
                            destinationMarker.on('click', function (e) {
                                globalThis[mapName].removeLayer(destinationMarker);
                                globalThis[mapName].removeLayer(edges);
                            });
                        })
                }
                const buildWagonPath = (wagnum) => {
                    fetch(`http://localhost:5000/api/stations/path?start_station_id=${wagnum.ST_ID_DISL}&end_station_id=${wagnum.TRAIN_INDEX.split('-')[2]}`)
                        .then(res => {
                            if (res.ok) {
                                // wagnumMarker.removeEventListener('click', buildWagonPath);
                                return res.json();
                            } else {
                                throw 'Something went wrong!';
                            }
                        })
                        .then((path) => {
                            const destinationColour = '#7036bd'

                            const markerHtmlStyles = `
                        background-color: ${destinationColour};
                        width: 3rem;
                        height: 3rem;
                        display: block;
                        left: -1.5rem;
                        top: -1.5rem;
                        position: relative;
                        border-radius: 3rem 3rem 0;
                        transform: rotate(45deg);
                        border: 1px solid #FFFFFF`

                            const icon = L.divIcon({
                                className: "my-custom-pin",
                                iconAnchor: [0, 24],
                                labelAnchor: [-6, 0],
                                popupAnchor: [0, -36],
                                html: `<span style="${markerHtmlStyles}" />`
                            })


                            const edges = L.polyline(path, { color: '#7036bd' });
                            edges.addTo(globalThis[mapName]);


                            const destinationMarker = L.marker([path[path.length - 1][0], path[path.length - 1][1]], { icon }).addTo(globalThis[mapName]);
                            destinationMarker.on('click', function (e) {
                                globalThis[mapName].removeLayer(destinationMarker);
                                globalThis[mapName].removeLayer(edges);
                            });
                        })
                }

                globalThis.buildWagonPath = buildWagonPath;
                trainMarker.bindPopup(
                    `<div style={"backgroud-color: #CACACA"}>
                Номер поезда: ${train_index}<br> 
                        Дата обновления: ${anyWagnum.wagnum.OPERDATE}<br>
                        ID станции прибытия поезда: ${anyWagnum.wagnum.TRAIN_INDEX.split('-')[2]}<br>
                        ID текущей станции: ${anyWagnum.wagnum.ST_ID_DISL}<br>
                        Координаты: ${anyWagnum.station.LATITUDE} широты, ${anyWagnum.station.LONGITUDE} долготы<br>
                        Количество вагонов: ${wagnums.length}<br><br>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Номер вагона</th>
                                    <th>Пункт назначения</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                            ${wagnums.map(({ station, wagnum }) => '<tr><td>' + (wagnum.WAGNUM) + '</td><td>' + wagnum.ST_ID_DISL + '</td><td><button onclick="globalThis.buildWagonPath({ST_ID_DISL:\''+wagnum.ST_ID_DISL+'\',TRAIN_INDEX:\''+train_index+'\'})">пункт назначения</buttom></td></tr>').join('')}
                            </tbody>
                            </table>
                        <br><br>
                </div>`
                );

                trainMarker.addEventListener('click', () => {
                    buildTrainPath();
                });
            });

    })
    .catch(console.log);
