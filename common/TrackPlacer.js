import React, { Component } from 'react';
import MapView from 'react-native-maps';
import {
    AppRegistry,
    Button,
    NativeModules,
    StyleSheet,
    Text,
    TextInput,
    TouchableHighlight,
    View
} from 'react-native';
// Custom components
import Comp from './Comp';

import ImageData from './ImageData';
import ImagePicker from './ImagePicker';
import TrackHandler from './TrackHandler';

import GreatCircle from './GreatCircle';
import Track from './Track';
import Learning from './Learning';

export default class TrackPlacer extends Component {
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
            radius: 20,
            poly: [],
            length: 0,
            track: null
        };
        this.componentDidMount = this.componentDidMount.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onRotate = this.onRotate.bind(this);
        this.onLongPress = this.onLongPress.bind(this);
        this.changeTrackLength = this.changeTrackLength.bind(this);

        this.parseTrack();
    }

    componentDidMount() {
    }

    parseTrack() {
        this.track = this.props.settings.track;
        this.state.length = Math.round(this.track.trackLength);
        //console.log(this.track);
        this.state.poly = this.track.coordinates;
        console.log(this.state.poly);
    }

    changeTrackLength(text) {
        try {
            this.state.length = text;
            var length = 0;
            try {
                length = parseInt(text);
            } catch (err) {
            }
            if (length > 10) {
                this.track.resizeToLength(this.state.length);
                TrackHandler.updateScale(this.track.name, this.track.scale);
            }
            this.setState(this.state)
        } catch (error) {
            console.log(error);
        }
        // TODO: Show error message: "Length has to be an integer"
    }

    render() {
        var t = this.state;
        return (
            <View style={styles.container}>
                <Button title={'done'} onPress={() => this.props.transition()}></Button>
                <MapView
                    style={styles.map}
                    mapType="satellite"
                    showsUserLocation={true}
                    initialRegion={this.state.region}
                    onLongPress={this.onLongPress}
                >
                    {
                        this.track.coordinates.map((c, i) => (
                            <MapView.Circle
                                key={c.latitude.toString() + c.longitude.toString() + i.toString()}
                                center={c}
                                radius={this.state.radius}
                                fillColor='#FFD158BA'
                                strokeColor='#FFD158BA'
                                strokeWidth={2}>
                            </MapView.Circle>
                        ))
                    }
                </MapView>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <Text style={styles.header}>Length</Text>
                    <TextInput
                        style={styles.textInput}
                        keyboardType={'numeric'}
                        onChangeText={this.changeTrackLength}
                        value={this.state.length.toString()}
                    />
                </View>
                <View style={styles.changeView}>
                    <Comp onChange={this.onResize} delta={0.05} cumulative={false} header={'resize'} />
                    <Comp onChange={this.onRotate} header={'rotate'} delta={15} />
                </View>
            </View>
        );
    }

    onRotate(v) {
        this.track.rotate(v);
        TrackHandler.updateRotation(this.track.name, this.track.rotation);
        this.setState(this.state);
    }

    onResize(v) {
        // Make the scale be from 1
        v = 1 + v
        this.track.resize(v);
        TrackHandler.updateScale(this.track.name, this.track.scale);
        this.setState(this.state);
    }

    onLongPress(loc) {
        var coordinate = loc.nativeEvent.coordinate;
        this.track.move(coordinate);
        TrackHandler.updateLocation(this.track.name, coordinate.latitude, coordinate.longitude);
        console.log('location', coordinate);
        this.setState(this.state);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F5FCFF',
    },
    textInput: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20
    },
    header: {
        fontSize: 20,
        marginLeft: 4,
        marginRight: 4,
        alignSelf: 'center'
    },
    map: {
        flex: 1
    },
    changeView: {
        flexDirection: 'row'
    }
});