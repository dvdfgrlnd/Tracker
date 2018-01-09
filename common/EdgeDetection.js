import React, { Component } from 'react';
import MapView from 'react-native-maps';
import {
    ActivityIndicator,
    AppRegistry,
    Button,
    Image,
    NativeModules,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    WebView
} from 'react-native';

import CanvasHTML from './Canvas.js';
import EdgeTransform from './Detection.js';
import ImagePicker from './ImagePicker';

export default class EdgeDetection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pixels: { colors: [] },
            html: CanvasHTML,
            loading: true
        };
        this.parsePixels = this.parsePixels.bind(this);
        this._onPress = this._onPress.bind(this);

        this.parsePixels();
    }

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(prevProps) == JSON.stringify(this.props) && JSON.stringify(prevState) == JSON.stringify(this.state)) {
            console.log("everything same");
        } else {
            console.log("state or props different");
        }
    }

    parsePixels() {
        // Transform array from '[{x:12, y:93, r:1, g:2, b:3, a:4, pixel:0}...]' to 
        // '[... 1, 2, 3, 4, ...]'
        //      | x:12,y:93 | <-- point
        // Pick image and perform edge detection immediatly
        ImagePicker.edgeDetection()
            .then((result) => {
                var imageBase64 = result.imageBase64;
                var pixels = result.edges;
                imageBase64 = 'data:image/png;base64,' + imageBase64;
                // console.log(res);
                this.state.imageSource = imageBase64;
                this.state.pixels.colors = pixels;
                this.state.loading = false;
                this.setState(this.state);
            })
            .catch((err) => console.log(err));
    }

    _onPress() {
        this.state.loading = true;
        this.setState(this.state);
        this.props.createTrack(this.state.pixels)
    }

    render() {
        // console.log('|', str, '|');
        return (
            <View style={styles.container}>
                <ActivityIndicator style={styles.activityIndicator} size="large" animating={this.state.loading} />
                <Image style={styles.previewImage} source={{ uri: this.state.imageSource }} />
                <Button title={'continue'} onPress={this._onPress}></Button>
            </View>
        );
    }

}
//<WebView ref={(webview) => this.webview = webview} injectedJavaScript={str} source={{ html: this.state.html }} javaScriptEnabledAndroid={true} />

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F5FCFF',
        margin: 5
    },
    previewImage: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#000',
        resizeMode: 'contain',
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
    activityIndicator: {
    },
    button: {
        flex: 1,
    },
    header: {
        fontSize: 20,
    }
});


        // console.log('transform', lastPoint);
        // var data = EdgeTransform(array, lastPoint.x, lastPoint.y);
        // console.log('transform done!');
        // data = data.reduce((p, c) => {
        //     if ((c.r < 1 || c.r > 255) && (c.g < 1 || c.g > 255) && (c.b < 1 || c.b > 255)) {
        //         return p;
        //     }
        //     // console.log(c);
        //     p.push(c);
        //     return p;
        // }, []);
        // var data_str = JSON.stringify(data);
        // // TODO! Seems to choke on to much data (~20000-30000). Remove all elements that only have zeros, make it sparse
        // console.log('data len', data.length);
        // var js_str = `
        //     var canvas = document.getElementById('canvas');
        //     var ctx = canvas.getContext("2d");
        //     var pixs=JSON.parse('`+ data_str + `');
        //     var ob=pixs[pixs.length-1];
        //     var width=ob.x+1;
        //     var height=ob.y+1;
        //     newCanvas=document.createElement('canvas');
        //     newCanvas.width=width;
        //     newCanvas.height=height;
        //     var ctx = newCanvas.getContext("2d");
        //     ctx.scale(0.5,0.5);
        //     var imageData = ctx.getImageData(0, 0, newCanvas.width, newCanvas.height);
        //     var data=imageData.data;
        //     var i=0;
        //     for (var y = 0; y < height; y++) {
        //         for (var x = 0; x < width; x++) {
        //             var ind = (y * (width * 4)) + (x * 4);
        //             var px=pixs[i];
        //             var p=px;
        //             if(x==px.x && y==px.y){
        //                 if(i<pixs.length-1){
        //                     i+=1;
        //                 }
        //             }else {
        //                 p={r:0, g:0, b:0, a:0};
        //             }
        //             data[ind] = p.r;
        //             data[ind + 1] = p.g;
        //             data[ind + 2] = p.b;
        //             data[ind + 3] = 255;
        //         }
        //     }
        //     ctx.putImageData(imageData, 0, 0);
        //     var ctx2=canvas.getContext("2d");
        //     ctx2.drawImage(newCanvas, 0,0,canvas.width, canvas.height);
        //     `;
        // //             ctx.fillStyle = 'green';
        // // document.write(height, width);
        // // document.write(canvas.height, canvas.width);
        // // document.write(newCanvas.height, newCanvas.width);
        // // ctx.fillRect(10, 10, 100, 100);`;
        // // js_str = `document.write("hello world");`;
        // // this.webview.injectJavaScript(js_str);
        // return js_str;