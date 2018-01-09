import React, { Component } from 'react';
import MapView from 'react-native-maps';
import {
    AppRegistry,
    Button,
    NativeModules,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from 'react-native';

export default class ColorDetection extends Component {
    constructor(props) {
        super(props);
        this.state = { pixels: [] };
        this.colorDiff = this.colorDiff.bind(this);
        this.parsePixels = this.parsePixels.bind(this);
    }

    colorDiff(c1, c2) {
        var da = Math.abs(c1.a - c2.a)
        var dr = Math.abs(c1.r - c2.r)
        var dg = Math.abs(c1.g - c2.g)
        var db = Math.abs(c1.b - c2.b)
        var diff = (da + dr + dg + db) / 4;
        //console.log('diff', diff);
        return diff;
    }

    componentWillMount() {
    }

    parsePixels(array) {
        //{ var argb = (c.a << 24) | (c.r << 16) | (c.g << 8) | c.b; c.pixel = argb; return 
        console.log('calc colors');
        //.filter((c, i) => c.pixel > 0)
        var colors = array.reduce((p, c) => {
            var found = false;
            for (var i = 0; i < p.length; i++) {
                var v = p[i];
                if (this.colorDiff(v, c) < 50) {
                    found = true;
                    v.colors.push(c);
                    break;
                }
            }
            if (!found) {
                var n = Object.assign({}, c);
                n.colors = [c];
                p.push(n);
            }
            return p;
        }, []);
        colors.forEach((d) => {
            //d.x *= -1;
            var red = d.colors.reduce((p, c) => {
                // Invert pixels y value due to image being flipped while read in
                c.y *= -1;
                // Add the color comoponents to sum
                p.a += c.a;
                p.r += c.r;
                p.g += c.g;
                p.b += c.b;
                return p;
            }, { a: 0, r: 0, g: 0, b: 0 });
            red.a /= d.colors.length;
            red.a = parseInt(red.a);
            red.r /= d.colors.length;
            red.r = parseInt(red.r);
            red.g /= d.colors.length;
            red.g = parseInt(red.g);
            red.b /= d.colors.length;
            red.b = parseInt(red.b);
            //console.log(red);
            var rr = red.r.toString(16), rg = red.g.toString(16), rb = red.b.toString(16), ra = red.a.toString(16);
            var addZero = (f) => f.length == 1 ? '0' + f : f;
            red.hex = '#' + addZero(rr) + addZero(rg) + addZero(rb) + addZero(ra);// 
            d.hex = red.hex;
        });
        //console.log(colors);
        this.state.colors = colors;
        //console.log(data[0]);
        //this.state.poly = coordinates;
    }

    render() {
        if (!this.state.colors && this.props.pixels.length > 0) {
            this.parsePixels(this.props.pixels);
        }else if(!this.state.colors){
            return null;
        }
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Choose track color</Text>
                <ScrollView>
                    {
                        this.state.colors.map((c, i) => {
                            var color = '#' + ('000000' + (0xffffff ^ parseInt(c.hex.substring(3), 16).toString(16))).slice(-6);
                            var header = {
                                fontSize: 25,
                                fontWeight: '100',
                                color,
                                alignSelf: 'center'
                            };
                            var key = i + c.hex.replace('#', '');
                            //console.log('hex', c.hex);
                            return (
                                <TouchableHighlight style={styles.colorContainer} key={key} onPress={() => this.props.createTrack(c)}>
                                    <View style={{ backgroundColor: c.hex, flex: 1 }} key={'view' + key}>
                                        <Text style={header}>{c.colors.length.toString()}</Text>
                                    </View>
                                </TouchableHighlight>
                            )
                        }
                        )
                    }
                </ScrollView>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F5FCFF',
        margin: 5
    },
    colorContainer: {
        flex: 1
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
