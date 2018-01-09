import React, { Component } from 'react';
import MapView from 'react-native-maps';
import {
    ActivityIndicator,
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
import TrackHandler from './TrackHandler';
import Track from './Track';

export default class TrackPicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tracks: [],
        };
        this.load = this.load.bind(this);
        this.openTrack = this.openTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);

        this.load();
    }

    render() {
        var t = this.state;
        return (
            <View style={styles.container} >
                <ScrollView>
                    {
                        this.state.tracks.map((track) => (
                            <TouchableHighlight style={styles.colorContainer} key={track.name} onPress={() => this.openTrack(track)}>
                                <View style={styles.horizontal}>
                                    <Text style={styles.header}>{track.name}</Text>
                                    <Button title={'delete'} style={styles.deleteButton} onPress={() => this.removeTrack(track.name)} />
                                </View>
                            </TouchableHighlight>
                        ))
                    }
                </ScrollView>
                <Button title={'new'} onPress={() => this.props.createNew()}></Button>
            </View >
        );
    }

    load() {
        TrackHandler.getTracks((array) => {
            this.state.tracks = array;
            this.setState(this.state);
        });
    }

    removeTrack(name) {
        TrackHandler.removeTrack(name, () => {
            this.load();
        });
    }

    openTrack(track) {
        TrackHandler.getPoints(track.name, (points) => {
            var newTrack = new Track(track.name, points, { latitude: track.latitude, longitude: track.longitude }, track.scale, track.rotation);
            this.props.settings.track = newTrack;
            this.props.transition();
        });
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F5FCFF',
    },
    colorContainer: {
        flex: 1,
        justifyContent: 'flex-start'
    },
    deleteButton: {
        backgroundColor: '#FF2F7E',
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 20,
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