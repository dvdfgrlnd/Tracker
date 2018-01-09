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

export default class Comp extends Component {
    constructor(props) {
        super(props);
        this.state = { value: 0 };
    }

    render() {
        var tmp = null;
        switch (this.props.directions) {
            default:
                tmp =
                    <View style={styles.vertical}>
                        <Button style={styles.button} title="+" onPress={() => this.onChange(1)} />
                        <Button style={styles.button} title="-" onPress={() => this.onChange(-1)} />
                    </View>;
        }
        return (
            <View style={styles.container}>
                <View style={styles.center}>
                    <Text style={styles.header} >{this.props.header}</Text>
                </View>
                {tmp}
            </View>
        );
    }

    onChange(direction) {
        var v = this.props.delta * direction;
        if (this.props.cumulative !== false) {
            this.state.value += (direction * (this.props.delta || 1));
            this.setState(this.state);
            v = this.state.value;
        }
        this.props.onChange(v);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F5FCFF',
        margin: 5
    },
    center: {
        alignItems: 'center',
    },
    vertical: {
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'space-around'

    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    button: {
        flex: 1,
    },
    header: {
        fontSize: 20,
    }
});