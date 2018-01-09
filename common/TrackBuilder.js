import React, { Component } from 'react';
import MapView from 'react-native-maps';
import {
    AppRegistry,
    Button,
    NativeModules,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from 'react-native';
// Custom components
import ImageData from './ImageData';
import ImagePicker from './ImagePicker';
import Comp from './Comp';

import GreatCircle from './GreatCircle';
import Track from './Track';
import Learning from './Learning';

export default class TrackBuilder extends Component {
    constructor(props) {
        super(props);
        var lat = 51.116113;
        var lon = -0.541740;
        this.state = {
            geofences: [],
            region: {
                latitude: lat,
                longitude: lon,
                latitudeDelta: 0.0422,
                longitudeDelta: 0.0221,
            },
            radius: 10,
            points: [],
            visitedLocations: [],
            location: {
                latitude: lat,
                longitude: lon,
            },
            detectionRange: 5,
            track: null
        };
        this.onChange = this.onChange.bind(this);

        this.track = this.props.settings.track;
        this.state.points = JSON.parse(JSON.stringify(this.track.coordinates));
        console.log(this.state.points);

        this.watchID = navigator.geolocation.watchPosition((position) => {
            console.log(position);
            this.state.location = position.coords;
            this.state.visitedLocations.push(this.state.location);
            this.checkInsideCircle(this.state.location);
            this.setState(this.state);
        });
    }

    checkInsideCircle(position) {
        // Check if the user is inside one point
        var index = this.state.points.findIndex((p) => {
            var distance = GreatCircle.distance(position, p)
            return distance < this.state.detectionRange;
        });
        console.log('index', index);
        if (index != -1) {
            // Delete point
            var p = Object.assign({}, this.state.points[index]);
            p.done = true;
            this.state.points[index] = p;
        }
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
    }

    render() {
        var t = this.state;
        return (
            <View style={styles.container}>
                <MapView
                    style={styles.map}
                    mapType="satellite"
                    showsUserLocation={true}
                    initialRegion={this.state.region}
                >
                    <MapView.Circle
                        key='circle'
                        center={this.state.location}
                        radius={8}
                        fillColor='#F000FF'
                        strokeColor='#F000FF'
                        strokeWidth={5}>
                    </MapView.Circle>
                    {
                        <MapView.Polyline
                            coordinates={this.state.visitedLocations.map(c => { return { latitude: c.latitude, longitude: c.longitude }; })}
                            strokeWidth={2}
                            strokeColor={'#F000FF'}
                        />
                    }
                    {
                        this.state.points.map((c, i) => (
                            <MapView.Circle
                                key={c.latitude.toString() + c.longitude.toString() + i.toString()}
                                center={c}
                                radius={this.state.radius}
                                fillColor={c.done ? '#00DB48' : '#FF9D00'}
                                strokeColor={c.done ? '#00DB48' : '#FF9D00'}
                                strokeWidth={2}>
                            </MapView.Circle>
                        ))
                    }
                </MapView>
            </View>
        );
    }

    onChange(value) {
        console.log(value);
        this.state.track.rotate(value * 10);
        this.setState(this.state);
    }

    onMapClick(event) {
        this.state.location = event.nativeEvent.coordinate;
        this.state.markers.latlng = this.state.location;
        this.setState(this.state);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F5FCFF',
    },
    markerText: {
        fontSize: 30,
        color: '#fff',
        backgroundColor: '#efefef'
    },
    map: {
        flex: 1
    },
    changeView: {
        flexDirection: 'row'
    }
});