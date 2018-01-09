/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Navigator,
    Text,
    TouchableHighlight,
    View
} from 'react-native';
import Launcher from './Launcher';
import TrackCreator from './TrackCreator';
import TrackPlacer from './TrackPlacer';
import TrackBuilder from './TrackBuilder';

export default class App extends Component {

    constructor(props) {
        super(props);
        this.routeNames = { picker: 0, placer: 1, builder: 2, launcher: 3 };
        this.routes = [{ id: this.routeNames.launcher },{ id: this.routeNames.picker },{ id: this.routeNames.placer },{ id: this.routeNames.builder },];
        this.state = {
            activeSettings: { track: null }
        };
        this.renderScene = this.renderScene.bind(this);
        this._onDidFocus = this._onDidFocus.bind(this);
    }

    render() {
        return (
            <Navigator
                initialRoute={this.routes[0]}
                renderScene={this.renderScene}
                onDidFocus={this._onDidFocus}
                />
        );
    }

    _onDidFocus(route) {
        if (route.component && route.id === this.routeNames.launcher) {
            route.component.load();
        }
    }

    renderScene(route, navigator) {
        // Function for transitioning to other scenes
        var transition = (id) => () => {
            var index = this.routes.findIndex((d) => d.id === id);
            var newRoute = this.routes[index];
            console.log(id,index,newRoute);
            navigator.push(newRoute);
        };

        var view;
        switch (route.id) {
            case this.routeNames.launcher:
                view = <Launcher createNew={transition(this.routeNames.picker)} transition={transition(this.routeNames.placer)} settings={this.state.activeSettings} ref={(r) => route.component = r} />
                break;
            case this.routeNames.picker:
                view = <TrackCreator transition={transition(this.routeNames.placer)} settings={this.state.activeSettings} />
                break;
            case this.routeNames.placer:
                view = <TrackPlacer transition={transition(this.routeNames.builder)} settings={this.state.activeSettings} />
                break;
            case this.routeNames.builder:
                view = <TrackBuilder settings={this.state.activeSettings} />
                break;
            default:
                view = <Launcher createNew={transition(this.routeNames.picker)} transition={transition(this.routeNames.placer)} settings={this.state.activeSettings} ref={(r) => route.component = r} />
                route.id = this.routeNames.placer;
                break;
        }
        //view = (<TrackPicker settings={this.state.activeSettings} />);
        console.log('changing', route.id);
        var onChange = (id) => {
            if (id === 0) {
                if (navigator.getCurrentRoutes().length > 1) {
                    navigator.pop();
                }
            } else if (id === 1 && this.routeNames[route.id + 1]) {
                navigator.push(route.id + 1);
            }
            console.log('onChange', id);
            //var index = this.routes.findIndex((d) => d.id === id);
            //var newRoute = this.routes[index];
            //navigator.jumpTo(newRoute);
        }
        var names = this.routeNames;
        return (
            <View style={styles.container} >
                <View style={styles.navbar}>
                    <TouchableHighlight style={(route.id === names.picker) ? styles.selectedNavbutton : styles.navbutton} onPress={() => onChange(0)} >
                        <Text style={styles.menuText}>Backward</Text>
                    </TouchableHighlight>
                    <TouchableHighlight style={(route.id === names.placer) ? styles.selectedNavbutton : styles.navbutton} onPress={() => onChange(1)} >
                        <Text style={styles.menuText}>Forward</Text>
                    </TouchableHighlight>
                </View >

                {view}
            </View >
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F5FCFF',
    },
    navbutton: {
        flex: 1,
        margin: 10,
    },
    selectedNavbutton: {
        flex: 2,
        padding: 10,
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F5FCFF',
    },
    map: {
        flex: 1
    },
    menuText: {
        fontSize: 20,
        textAlign: 'center',
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});
/*
                    <TouchableHighlight style={(route.id === names.picker) ? styles.selectedNavbutton : styles.navbutton} onPress={() => onChange(this.routeNames.picker)} >
                        <Text style={styles.menuText}>Picker</Text>
                    </TouchableHighlight>
                    <TouchableHighlight style={(route.id === names.placer) ? styles.selectedNavbutton : styles.navbutton} onPress={() => onChange(this.routeNames.placer)} >
                        <Text style={styles.menuText}>Placer</Text>
                    </TouchableHighlight>
                    <TouchableHighlight style={(route.id === names.builder) ? styles.selectedNavbutton : styles.navbutton} onPress={() => onChange(this.routeNames.builder)} >
                        <Text style={styles.menuText}>Builder</Text>
                    </TouchableHighlight>
*/