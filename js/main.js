const sound=new warningSound();

const dashboard=new Dashboard(document.getElementById('dashboard'));


// const rect1=dashboard.newRect({
//     x:20,
//     y:20,
//     height:1160,
//     width:1960,
// });

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
    angle:-450,
});

const compass=dashboard.newCompass({
    x:1600,
    y:200,
    size:70,
});

const led=dashboard.newLED({
    x:124,
    y:197,
    size:25,
    onColor:' #ff0000',
    offColor:' #00ff00'
});

let add=true;
let loop=setInterval(()=>{
    if(add){
        speed.value++;
        bettery.value-=2;
        carWhell.angle+=21;
        compass.angle+=7.2;
        if(speed.value>=50){
            add=!add;
        }
    }else{
        speed.value--;
        bettery.value+=2;
        carWhell.angle-=21;
        compass.angle-=7.2;
        if(speed.value<=0){
            add=!add;
        }
    }
    led.value=add;
},50);