import React, { Component } from 'react';
import MapView from 'react-native-maps';
import {
    AppRegistry,
    Button,
    Modal,
    NativeModules,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableHighlight,
    View
} from 'react-native';
// Custom components
import ImagePicker from './ImagePicker';
import TrackHandler from './TrackHandler';
import Position from './Position';

import Learning from './Learning';
import Track from './Track';
import ColorDetection from './ColorDetection';
import EdgeDetection from './EdgeDetection';

export default class TrackCreator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            numOfPoints: 60,
            name: '',
            colors: [],
            modalVisible: false,
            pixels: [],
        };
        this.createTrack = this.createTrack.bind(this);

    }


    createTrack(c) {
        if (!this.state.name) {
            alert("No name has been specified");
            return;
        }
        if (this.state.numOfPoints < 1) {
            alert("Atleast one point is required");
            return;
        }
        var data = Learning.knearest(c.colors, this.state.numOfPoints).map((v) => v.point);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log(position);
                var coord = position.coords;
                TrackHandler.createTrack({ name: this.state.name, latitude: coord.latitude, longitude: coord.longitude, points: data }, () => { });
                this.props.settings.track = new Track(this.state.name, data, coord);
                this.props.transition();
            }, error => console.log(error), { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 });
    }

    render() {
        var detection = null;
        if (false) {
            detection = (
                <ColorDetection createTrack={this.createTrack} />
            );
        } else {
            detection = (
                <EdgeDetection createTrack={this.createTrack} />
            );
        }
        var t = this.state;
        return (
            <View style={styles.container} >
                <View style={styles.horizontal}>
                    <Text style={styles.header}>Name</Text>
                    <TextInput
                        style={styles.textInput}
                        onChangeText={(text) => { this.state.name = text; this.setState(this.state) }}
                        value={this.state.name}
                    />
                </View>
                <View style={styles.horizontal}>
                    <Text style={styles.header}># points</Text>
                    <TextInput
                        style={styles.textInput}
                        keyboardType={'numeric'}
                        onChangeText={(text) => { this.state.numOfPoints = parseInt(text); this.setState(this.state) }}
                        value={this.state.numOfPoints.toString()}
                    />
                </View>
                {detection}
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F5FCFF',
    },
    colorContainer: {
        flex: 1
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    textInput: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20
    },
    header: {
        fontSize: 25,
        fontWeight: '100',
        alignSelf: 'center'
    },
});