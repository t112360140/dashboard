const sound=new warningSound();

const dashboard=new Dashboard(document.getElementById('dashboard'));


// const rect1=dashboard.newRect({
//     x:20,
//     y:20,
//     height:1160,
//     width:1960,
// });

const ipSet=dashoard.newButton({
    x:1835,
    y:80,
    text:'',
    height:50,width:50,
    onclick:()=>{
        const ip=prompt('New IP:');
        if(ip){
            ros = new ROSLIB.Ros({
                url : `ws://${ip}:9090`
            });
        }
    }
});

const fullScreen=dashboard.newButton({
    x:1950,
    y:0,
    height:50,
    width:50,
    text:'',
    size:45,
    fill:true,
    // color:' #ffffff',
    onclick:()=>{
        if(document.fullscreenElement){
            document.exitFullscreen();
        }else{
            document.documentElement.requestFullscreen();
        }
    },
});

const speed=dashboard.newCircularDial({
    x:550,
    y:600,
    radius:400,
    min:0,
    max:50,
    value:0,
    color:[[50,80],[' #00ff00',' #ffff00',' #ff0000'],false],
    unit:'km/h',
    style:0,

    barWidth:0.7,
});
const bettery=dashboard.newLinearDial({
    x:1100,
    y:100,
    height:320,
    width:80,
    min:0,
    max:100,
    value:100,
    split:5,
    color:[[20,50],[' #ff0000',' #ffff00',' #00ff00'],false],
    unit:'%',
});

const carNear=dashboard.newCarProximity({
    x:1400,
    y:800,
    split:5,
    showCar:true,
});

const carWhell=dashboard.newSteeringWheel({
    x:1700,
    y:700,
    size:70,
    angle:0,
});

const compass=dashboard.newCompass({
    x:1600,
    y:200,
    size:70,
});

const connectState=dashboard.newLED({
    x:124,
    y:197,
    size:25,
    onColor:' #00ff00',
    offColor:' #ff0000'
});

const soundTest1=dashboard.newButton({
    x:1375,
    y:525,
    height:50,
    width:50,
    text:'',
    onclick:()=>{
        let oldData=cloneJSON(carNear.data);
        oldData[0]=(oldData[0]+1)%6;
        carNear.updata(oldData);
    }
});
const soundTest2=dashboard.newButton({
    x:1245,
    y:570,
    height:50,
    width:50,
    text:'',
    onclick:()=>{
        let oldData=cloneJSON(carNear.data);
        oldData[9]=(oldData[9]+1)%6;
        carNear.updata(oldData);
    }
});
const soundTest3=dashboard.newButton({
    x:1525,
    y:570,
    height:50,
    width:50,
    text:'',
    onclick:()=>{
        let oldData=cloneJSON(carNear.data);
        oldData[1]=(oldData[1]+1)%6;
        carNear.updata(oldData);
    }
});


// Connecting to ROS
// -----------------

var ros = new ROSLIB.Ros({
    url : 'ws://localhost:9090'
});

ros.on('connection', function() {
    connectState.value=true;
    console.log('Connected to websocket server.');
});

ros.on('error', function(error) {
    connectState.value=false;
    console.log('Error connecting to websocket server: ', error);
});

ros.on('close', function() {
    connectState.value=false;
    console.log('Connection to websocket server closed.');
});


// Publishing a Topic
// ------------------

var cmdVel = new ROSLIB.Topic({
    ros : ros,
    name : '/turtle1/cmd_vel',
    messageType : 'geometry_msgs/Twist'
});

const forward=dashboard.newButton({
    x:1035,
    y:810,
    text:'^',
    height:50,
    width:50,
    onclick:()=>{
        var twist = new ROSLIB.Message({
            linear : {
                x : 2,
                y : 0,
            },
            angular : {
                z : 0
            }
        });
        cmdVel.publish(twist);
    },
});
const back=dashboard.newButton({
    x:1035,
    y:865,
    text:'v',
    height:50,
    width:50,
    onclick:()=>{
        var twist = new ROSLIB.Message({
            linear : {
                x : -1,
                y : 0,
            },
            angular : {
                z : 0
            }
        });
        cmdVel.publish(twist);
    },
});
const right=dashboard.newButton({
    x:1090,
    y:865,
    text:'>',
    height:50,
    width:50,
    onclick:()=>{
        var twist = new ROSLIB.Message({
            linear : {
                x : 0,
                y : 0,
            },
            angular : {
                z : -90*(Math.PI/180)
            }
        });
        cmdVel.publish(twist);
    },
});
const left=dashboard.newButton({
    x:980,
    y:865,
    text:'<',
    height:50,
    width:50,
    onclick:()=>{
        var twist = new ROSLIB.Message({
            linear : {
                x : 0,
                y : 0,
            },
            angular : {
                z : 90*(Math.PI/180)
            }
        });
        cmdVel.publish(twist);
    },
});

// Subscribing to a Topic
// ----------------------

var listener = new ROSLIB.Topic({
    ros : ros,
    name : '/turtle1/pose',
    messageType : 'turtlesim/Pose'
});

listener.subscribe(function(message) {
    speed.value=message.linear_velocity*10;
    carWhell.angle=-message.angular_velocity*(180/Math.PI);
    // listener.unsubscribe();
});

// Calling a service
// -----------------

var resetTurtle = new ROSLIB.Service({
    ros : ros,
    name : '/reset',
    serviceType : 'std_srvs/Empty'
});

const resetBT=dashboard.newButton({
    x:1010,
    y:600,
    height:50,
    width:150,
    text:'Reset',
    onclick:()=>{
        var request = new ROSLIB.ServiceRequest({});

        resetTurtle.callService(request, function(result) {
            console.log(`Result for service call on ${resetTurtle.name} : ${result.sum}`);
        });

        
        RedValue.set(Math.floor(Math.random()*256));
        GreenValue.set(Math.floor(Math.random()*256));
        BlueValue.set(Math.floor(Math.random()*256));
    },
});

// Getting and setting a param value
// ---------------------------------

// ros.getParams(function(params) {
//     console.log(params);
// });

var RedValue = new ROSLIB.Param({
    ros : ros,
    name : '/turtlesim/background_r'
});
var GreenValue = new ROSLIB.Param({
    ros : ros,
    name : '/turtlesim/background_g'
});
var BlueValue = new ROSLIB.Param({
    ros : ros,
    name : '/turtlesim/background_b'
});

RedValue.set(Math.floor(Math.random()*256));
GreenValue.set(Math.floor(Math.random()*256));
BlueValue.set(Math.floor(Math.random()*256));
// BlueValue.get(function(value) {
//     console.log('Blue Value: ' + value);
// });
