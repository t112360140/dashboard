class Dashboard{
    element=[];
    debug=true;

    constructor(canvas,config={}){
        this.canvas=canvas;
        this.ctx=this.canvas.getContext("2d");

        this.height=config.height??canvas.height??1200;
        this.width=config.width??canvas.width??2000;
        this.background=config.background??' #000000';

        this.init();
        this.start();

        this.canvas.addEventListener('click',(event)=>{
            const rect=this.canvas.getBoundingClientRect();
            const x=Math.round(((event.layerX-rect.x)/this.canvas.offsetWidth)*this.width);
            const y=Math.round(((event.layerY-rect.y)/this.canvas.offsetHeight)*this.height);
            for(let i=this.element.length-1;i>=0;i--){
                if(this.element[i].show){
                    const item=this.element[i];
                    if(item.onclick&&
                        item.x<x&&x<(item.x+item.width)&&
                        item.y<y&&y<(item.y+item.height)
                    ){
                        item.onclick();
                        break;
                    }
                }
            }
        });
        
        this.canvas.addEventListener('contextmenu',(event)=>{
            const rect=this.canvas.getBoundingClientRect();
            const x=Math.round(((event.layerX-rect.x)/this.canvas.offsetWidth)*this.width);
            const y=Math.round(((event.layerY-rect.y)/this.canvas.offsetHeight)*this.height);
            if(this.debug){
                copyToClipboard(`x:${x}, y:${y}`);
            }
            event.preventDefault();
        });
    }

    init(){
        this.ctx.fillStyle=this.background;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.element=[];
    }

    start(){
        this.loop=setInterval(()=>{
            this.frame();
        },15);
    }

    stop(){
        if(this.loop){
            clearInterval(this.loop);
        }
    }

    frame(){
        const ctx=this.ctx;
        ctx.fillStyle=this.background;
        ctx.fillRect(0, 0, this.width, this.height);
        for(let i=0;i<this.element.length;i++){
            const item=this.element[i];
            if(item.show){
                switch(item.type){
                    case 'Text':{
                        ctx.beginPath();
                        ctx.fillStyle=item.color;
                        ctx.textBaseline='middle';
                        ctx.textAlign='center';
                        ctx.font=`${item.size}px sans-serif`;
                        ctx.fillText(`${item.text}`,item.x,item.y);
                        break;
                    }
                    case 'Rect':{
                        ctx.beginPath();
                        ctx.strokeStyle=item.color;
                        ctx.lineWidth=3;
                        ctx.rect(item.x,item.y,item.width,item.height);
                        ctx.stroke();
                        break;
                    }
                    case 'Button':{
                        ctx.beginPath();
                        ctx.lineWidth=3;
                        if(item.fill){
                            ctx.fillStyle=item.fillColor;
                            ctx.fillRect(item.x,item.y,item.width,item.height);
                        }
                        ctx.strokeStyle=item.color;
                        ctx.rect(item.x,item.y,item.width,item.height);
                        ctx.stroke();

                        ctx.fillStyle=item.color;
                        ctx.textBaseline='middle';
                        ctx.textAlign='center';
                        ctx.font=`${item.size}px sans-serif`;
                        ctx.fillText(`${item.text}`,item.x+item.width/2,item.y+item.height/2);
                        break;
                    }
                    case 'CircuitDial':{
                        ctx.beginPath();
                        switch(item.style){
                            default:{
                                ctx.strokeStyle=' #ffffff';
                                ctx.fillStyle=' #ffffff'
                                ctx.lineWidth=3;

                                ctx.arc(item.x,item.y,item.radius,(item.minAngle)*(Math.PI/180),(item.maxAngle)*(Math.PI/180),false);
                                for(let i=0;i<item.split;i++){
                                    drawSplit(item.minAngle+(((item.maxAngle-item.minAngle+720)%360)/item.split)*i,Math.round(((item.max-item.min)*(i/item.split)+(item.min))*10)/10);
                                }
                                drawSplit(item.maxAngle,item.max);
                                function drawSplit(angle=0,text='Wah!'){
                                    const sin=Math.sin(angle*(Math.PI/180));
                                    const cos=Math.cos(angle*(Math.PI/180));
                                    ctx.moveTo(item.radius*cos+item.x,item.radius*sin+item.y);
                                    ctx.lineTo((item.radius*item.splitWidth)*cos+item.x,(item.radius*item.splitWidth)*sin+item.y);

                                    ctx.textBaseline='middle';
                                    ctx.textAlign='center';
                                    ctx.font=`${Math.round(25*(item.radius/200))}px sans-serif`;
                                    ctx.fillText(text.toString(),(item.radius*1.1)*cos+item.x,(item.radius*1.1)*sin+item.y);
                                }

                                item.buffer.push(item.value);
                                if(item.buffer.length>item.maxBuffer){
                                    item.buffer=item.buffer.slice(1);
                                }
                                let sum=0;
                                for(let i=0;i<item.buffer.length;i++){
                                    sum+=item.buffer[i];
                                }
                                const value=Math.round(sum/item.buffer.length);
                                ctx.stroke();
                                if(item.style===1){
                                    ctx.strokeStyle=item.color[1][item.color[1].length-1];
                                    for(let i=item.color[0].length-1;i>0;i--){
                                        if((((value-item.min)/(item.max-item.min))*100)<item.color[0][i]){
                                            ctx.strokeStyle=item.color[1][i-1]??' #ff0000';
                                        }
                                    }
                                    ctx.lineWidth=item.barLineWidth;
                                    ctx.beginPath();
                                    const angle=((value-item.min)/(item.max-item.min))*((item.maxAngle-item.minAngle+720)%360)+item.minAngle;
                                    const sin=Math.sin(angle*(Math.PI/180));
                                    const cos=Math.cos(angle*(Math.PI/180));
                                    ctx.moveTo((item.radius*item.splitWidth)*cos+item.x,(item.radius*item.splitWidth)*sin+item.y);
                                    ctx.lineTo((item.radius*item.barWidth)*cos+item.x,(item.radius*item.barWidth)*sin+item.y);
                                    ctx.stroke();
                                }else{
                                    ctx.beginPath();
                                    const chunkAngle=((item.maxAngle-item.minAngle+720)%360)/(item.max-item.min);
                                    let colorIndex=0;
                                    ctx.lineWidth=1;
                                    for(let i=item.min+1;i<=item.max;i++){
                                        if(value>=i){
                                            drawChunk(item.minAngle+chunkAngle*(i-item.min-1),item.minAngle+chunkAngle*(i-item.min),item.color[1][colorIndex]??' #ff0000');
                                        }
                                        if(((colorIndex)<item.color[0].length)&&(((i-item.min)/(item.max-item.min))*100)>=item.color[0][colorIndex]){
                                            if(!item.color[2]){
                                                ctx.fill();
                                                ctx.beginPath();
                                            }
                                            colorIndex++;
                                        }
                                    }
                                    function drawChunk(start,end,color){
                                        ctx.strokeStyle=color;
                                        ctx.fillStyle=color;
                                        const sin=[Math.sin(start*(Math.PI/180)),Math.sin(end*(Math.PI/180))];
                                        const cos=[Math.cos(start*(Math.PI/180)),Math.cos(end*(Math.PI/180))];
                                        ctx.moveTo((item.radius*item.splitWidth)*cos[0]+item.x,(item.radius*item.splitWidth)*sin[0]+item.y);
                                        ctx.arc(item.x,item.y,(item.radius*item.splitWidth),(start)*(Math.PI/180),(end)*(Math.PI/180),false);
                                        ctx.lineTo((item.radius*item.barWidth)*cos[1]+item.x,(item.radius*item.barWidth)*sin[1]+item.y);
                                        ctx.arc(item.x,item.y,(item.radius*item.barWidth),(end)*(Math.PI/180),(start)*(Math.PI/180),true);
                                        ctx.closePath();
                                    }
                                    ctx.fill();
                                }

                                ctx.fillStyle=' #ffffff';
                                ctx.textBaseline='middle';
                                ctx.textAlign='center';
                                ctx.font=`${Math.round(100*(item.radius/200))}px sans-serif`;
                                ctx.fillText(Math.round(sum/item.buffer.length).toString(),item.x,item.y);
                                ctx.font=`${Math.round(30*(item.radius/200))}px sans-serif`;
                                ctx.fillText(item.unit,item.x,item.y+Math.round(60*(item.radius/200)));
                                break;
                            }
                        }
                        break;
                    }
                    case 'LineDial':{
                        ctx.beginPath();
                        switch(item.style){
                            default:{
                                if(!item.horizontal){
                                    ctx.strokeStyle=' #ffffff';
                                    ctx.lineWidth=2;
                                    ctx.beginPath();
                                    const colorList=item.color[0].concat([100]).map(i=>((i/100)*(item.max-item.min)+item.min));
                                    let lastHeight=item.min;

                                    item.buffer.push(item.value);
                                    if(item.buffer.length>item.maxBuffer){
                                        item.buffer=item.buffer.slice(1);
                                    }
                                    let sum=0;
                                    for(let i=0;i<item.buffer.length;i++){
                                        sum+=item.buffer[i];
                                    }
                                    const value=Math.round(sum/item.buffer.length);
                                    if(item.color[2]){
                                        for(let i=0;i<colorList.length;i++){
                                            if(value<colorList[i]){
                                                ctx.fillStyle=item.color[1][i];
                                                break;
                                            }
                                        }
                                    }
                                    for(let i=0;i<colorList.length;i++){
                                        if(!item.color[2]){
                                            ctx.fillStyle=item.color[1][i];
                                        }
                                        if(value<colorList[i]){
                                            ctx.fillRect(item.x,item.y+(1-(value-item.min)/(item.max-item.min))*item.height,item.width,((value-lastHeight)/(item.max-item.min))*item.height);
                                            break;
                                        }else{
                                            ctx.fillRect(item.x,item.y+(1-(colorList[i]-item.min)/(item.max-item.min))*item.height,item.width,((colorList[i]-lastHeight)/(item.max-item.min))*item.height);
                                            lastHeight=colorList[i];
                                        }
                                    }
                                    ctx.beginPath();
                                    ctx.rect(item.x,item.y,item.width,item.height);
                                    for(let i=0;i<=item.split;i++){
                                        ctx.moveTo(item.x,(item.y+item.height*(1-i/item.split)));
                                        ctx.lineTo(item.x+item.width*1.2,(item.y+item.height*(1-i/item.split)));

                                        ctx.textBaseline='middle';
                                        ctx.textAlign='left';
                                        ctx.fillStyle=' #ffffff';
                                        ctx.font=`${Math.round(25*(item.height/300))}px sans-serif`;
                                        ctx.fillText(Math.round((i/item.split)*(item.max-item.min)+item.min).toString(),item.x+item.width*1.3,(item.y+item.height*(1-i/item.split)));
                                    }
                                }else{
                                    console.log(`I dont make this function :D`);
                                }
                                ctx.stroke();
                                break;
                            }
                        }
                        break;
                    }
                    case 'CarProximity':{
                        ctx.beginPath();
                        ctx.strokeStyle=' #ffffff';
                        ctx.lineWidth=2;
                        for(let i=0;i<item.data.length;i++){
                            const angle=(360/item.data.length)*i-(90+(360/item.data.length)/2);
                            const sin=Math.sin(angle*(Math.PI/180));
                            const cos=Math.cos(angle*(Math.PI/180));
                            ctx.moveTo(item.x,item.y);
                            ctx.lineTo((item.size)*cos+item.x,(item.size)*sin+item.y);
                        }
                        ctx.stroke();

                        for(let i=0;i<item.data.length;i++){
                            const angle1=(360/item.data.length)*i-(90+(360/item.data.length)/2)+1;
                            const sin1=Math.sin(angle1*(Math.PI/180));
                            const cos1=Math.cos(angle1*(Math.PI/180));
                            const angle2=(360/item.data.length)*i-(90-(360/item.data.length)/2)-1;
                            const sin2=Math.sin(angle2*(Math.PI/180));
                            const cos2=Math.cos(angle2*(Math.PI/180));
                            for(let j=0;j<item.split;j++){
                                if(item.data[i]<=j){
                                    break;
                                }
                                ctx.fillStyle=`rgb(
                                    ${(item.color[1][0]-item.color[0][0])*(j/item.split)+item.color[0][0]},
                                    ${(item.color[1][1]-item.color[0][1])*(j/item.split)+item.color[0][1]},
                                    ${(item.color[1][2]-item.color[0][2])*(j/item.split)+item.color[0][2]})`;
                                ctx.beginPath();
                                ctx.moveTo(item.x+(item.size*(0.99-j/item.split))*cos1,item.y+(item.size*(0.99-j/item.split))*sin1);
                                ctx.arc(item.x,item.y,(item.size*(0.99-j/item.split)),(angle1)*(Math.PI/180),(angle2)*(Math.PI/180),false);
                                ctx.lineTo(item.x+(item.size*(1-(j+1)/item.split))*cos2,item.y+(item.size*(1-(j+1)/item.split))*sin2);
                                ctx.arc(item.x,item.y,(item.size*(1-(j+1)/item.split)),(angle2)*(Math.PI/180),(angle1)*(Math.PI/180),true);
                                ctx.closePath();
                                ctx.fill();
                            }
                        }
                        if(item.showCar){
                            ctx.beginPath();
                            ctx.fillStyle=' #000000';
                            ctx.fillRect(item.x-(item.size*2/20),item.y-(item.size*3/20),item.size*2/10,item.size*3/10);
                            ctx.rect(item.x-(item.size*2/20),item.y-(item.size*3/20),item.size*2/10,item.size*3/10);
                            ctx.stroke();
                        }
                        break;
                    }
                    case 'SteeringWheel':{
                        item.buffer.push(item.angle);
                        if(item.buffer.length>item.maxBuffer){
                            item.buffer=item.buffer.slice(1);
                        }
                        let sum=0;
                        for(let i=0;i<item.buffer.length;i++){
                            sum+=item.buffer[i];
                        }
                        const value=Math.round(sum/item.buffer.length);

                        const angle=270+value;
                        const sin=(a)=>Math.sin(a*(Math.PI/180));
                        const cos=(a)=>Math.cos(a*(Math.PI/180));
                        ctx.strokeStyle=item.color[0]??' #ffffff';
                        ctx.fillStyle=item.color[0]??' #ffffff';
                        

                        ctx.beginPath();
                        ctx.lineWidth=item.size*0.1;
                        ctx.arc(item.x,item.y,item.size,0,2*Math.PI,true);
                        ctx.stroke();
                        
                        ctx.beginPath();
                        ctx.moveTo((item.size)*cos(angle-80)+item.x,(item.size)*sin(angle-80)+item.y);
                        ctx.bezierCurveTo(
                            (item.size*0.4)*cos(angle-115)+item.x,(item.size*0.4)*sin(angle-115)+item.y,
                            (item.size*0.4)*cos(angle-115)+item.x,(item.size*0.4)*sin(angle-115)+item.y,
                            (item.size)*cos(angle-150)+item.x,(item.size)*sin(angle-150)+item.y,
                        );
                        ctx.bezierCurveTo(
                            (item.size*0.6)*cos(angle-180)+item.x,(item.size*0.6)*sin(angle-180)+item.y,
                            (item.size*0.6)*cos(angle-180)+item.x,(item.size*0.6)*sin(angle-180)+item.y,
                            (item.size)*cos(angle+150)+item.x,(item.size)*sin(angle+150)+item.y,
                        );
                        ctx.bezierCurveTo(
                            (item.size*0.4)*cos(angle+115)+item.x,(item.size*0.45)*sin(angle+115)+item.y,
                            (item.size*0.4)*cos(angle+115)+item.x,(item.size*0.4)*sin(angle+115)+item.y,
                            (item.size)*cos(angle+80)+item.x,(item.size)*sin(angle+80)+item.y,
                        );
                        ctx.closePath();
                        ctx.fill();

                        ctx.beginPath();
                        ctx.lineWidth=(item.size*0.1);
                        for(let i=0;i<Math.ceil(Math.abs(value)/360);i++){
                            ctx.arc(item.x,item.y,(item.size*1.2),-Math.PI/2,(value-90)*(Math.PI/180),value<0);
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.strokeStyle=item.color[i]??`#${cyrb53(`${i}${i}${i}`).slice(0,6)}`;
                        }
                        ctx.arc(item.x,item.y,(item.size*1.2),-Math.PI/2,(value%360-90)*(Math.PI/180),value<0);
                        ctx.stroke();
                        break;
                    }
                    case 'Compass':{
                        const angle=270+item.angle;
                        const sin=(a)=>Math.sin(a*(Math.PI/180));
                        const cos=(a)=>Math.cos(a*(Math.PI/180));

                        ctx.lineWidth=3;
                        ctx.beginPath();
                        ctx.fillStyle=item.northColor;
                        ctx.moveTo(item.size*cos(angle)+item.x,item.size*sin(angle)+item.y);
                        ctx.lineTo(item.size*cos(angle-90)*0.2+item.x,item.size*sin(angle-90)*0.2+item.y);
                        ctx.lineTo(item.size*cos(angle+90)*0.2+item.x,item.size*sin(angle+90)*0.2+item.y);
                        ctx.closePath();
                        ctx.fill();
                        ctx.beginPath();
                        ctx.fillStyle=item.southColor;
                        ctx.moveTo(item.size*cos(angle+180)+item.x,item.size*sin(angle+180)+item.y);
                        ctx.lineTo(item.size*cos(angle-90)*0.2+item.x,item.size*sin(angle-90)*0.2+item.y);
                        ctx.lineTo(item.size*cos(angle+90)*0.2+item.x,item.size*sin(angle+90)*0.2+item.y);
                        ctx.closePath();
                        ctx.fill();
                        ctx.beginPath();
                        ctx.strokeStyle=' #ffffff';
                        ctx.arc(item.x,item.y,item.size,0,2*Math.PI);
                        ctx.stroke();

                        ctx.textBaseline='middle';
                        ctx.textAlign='center';
                        ctx.fillStyle=' #ffffff';
                        ctx.font=`${Math.round(30*(item.size/100))}px sans-serif`;
                        ctx.fillText('N',item.size*cos(angle)*1.2+item.x,item.size*sin(angle)*1.2+item.y);
                        break;
                    }
                    case 'LED':{
                        ctx.beginPath();
                        ctx.lineWidth=1;
                        if(item.value){
                            ctx.fillStyle=item.onColor;
                        }else{
                            ctx.fillStyle=item.offColor;
                        }
                        ctx.arc(item.x,item.y,item.size,0,2*Math.PI);
                        ctx.fill();
                        break;
                    }
                    default:{
                        console.log(`Unknow element: ${this.element[i].type}`);
                    }
                }
            }
        }
    }

    newCircularDial(config={}){
        const id=uuid();
        const data={
            id:id,
            type:'CircuitDial',
            x:config.x??100,
            y:config.y??100,
            radius:config.radius??50,
            min:config.min??0,
            value:config.value??50,
            max:config.max??100,
            minAngle:config.minAngle??-225,
            maxAngle:config.maxAngle??45,
            color:config.color??[[50],[' #00ff00',' #ff0000'],false],
            show:config.show??true,
            split:config.split??10,
            style:config.style??0,
            unit:config.unit??'',
            maxBuffer:config.maxBuffer??20,
            buffer:[],

            barWidth:config.barWidth??0.75,
            barLineWidth:config.barLineWidth??10,
            splitWidth:config.splitWidth??0.95,

            remove:()=>{
                for(let i=0;i<this.element.length;i++){
                    if(this.element[i].id===id){
                        this.element[i]=null;
                    }
                }
                this.element=this.element.filter(t=>t);
            }
        }
        this.element.push(data);
        return data;
    }

    newLinearDial(config={}){
        const id=uuid();
        const data={
            id:id,
            type:'LineDial',
            x:config.x??100,
            y:config.y??100,
            height:config.height??120,
            width:config.width??30,
            horizontal:config.horizontal??false,
            min:config.min??0,
            value:config.value??50,
            max:config.max??100,
            color:config.color??[[50],[' #00ff00',' #ff0000'],false],
            show:config.show??true,
            split:config.split??2,
            style:config.style??0,
            unit:config.unit??'',
            maxBuffer:config.maxBuffer??20,
            buffer:[],

            remove:()=>{
                for(let i=0;i<this.element.length;i++){
                    if(this.element[i].id===id){
                        this.element[i]=null;
                    }
                }
                this.element=this.element.filter(t=>t);
            }
        }
        this.element.push(data);
        return data;
    }

    newText(config){
        const id=uuid();
        const data={
            id:id,
            type:'Text',
            x:config.x??100,
            y:config.y??100,
            text:config.text??'Wah!',
            size:config.size??50,
            color:config.color??' #ffffff',

            show:config.show??true,

            remove:()=>{
                for(let i=0;i<this.element.length;i++){
                    if(this.element[i].id===id){
                        this.element[i]=null;
                    }
                }
                this.element=this.element.filter(t=>t);
            }
        }
        this.element.push(data);
        return data;
    }
    
    newRect(config){
        const id=uuid();
        const data={
            id:id,
            type:'Rect',
            x:config.x??100,
            y:config.y??100,
            height:config.height??100,
            width:config.width??100,
            color:config.color??' #ffffff',

            show:config.show??true,

            remove:()=>{
                for(let i=0;i<this.element.length;i++){
                    if(this.element[i].id===id){
                        this.element[i]=null;
                    }
                }
                this.element=this.element.filter(t=>t);
            }
        }
        this.element.push(data);
        return data;
    }

    newButton(config){
        const id=uuid();
        const data={
            id:id,
            type:'Button',
            x:config.x??100,
            y:config.y??100,
            height:config.height??100,
            width:config.width??100,
            text:config.text??'Text',
            size:config.size??25,
            color:config.color??' #000000',
            fill:config.fill??true,
            fillColor:config.fillColor??' #ffffff',

            show:config.show??true,

            onclick:config.onclick??function(){alert('Hello! You find me!');},

            remove:()=>{
                for(let i=0;i<this.element.length;i++){
                    if(this.element[i].id===id){
                        this.element[i]=null;
                    }
                }
                this.element=this.element.filter(t=>t);
            }
        }
        this.element.push(data);
        return data;
    }

    newCompass(config){
        const id=uuid();
        const data={
            id:id,
            type:'Compass',
            x:config.x??100,
            y:config.y??100,
            size:config.size??100,
            northColor:config.northColor??' #ff0000',
            southColor:config.southColor??' #ffffff',

            angle:config.angle??0,

            show:config.show??true,

            remove:()=>{
                for(let i=0;i<this.element.length;i++){
                    if(this.element[i].id===id){
                        this.element[i]=null;
                    }
                }
                this.element=this.element.filter(t=>t);
            }
        }
        this.element.push(data);
        return data;
    }

    newSteeringWheel(config){
        const id=uuid();
        const data={
            id:id,
            type:'SteeringWheel',
            x:config.x??100,
            y:config.y??100,
            size:config.size??100,
            color:config.color??[' #ffffff','rgb(128, 128, 255)','rgb(255, 128, 128)'],
            maxBuffer:config.maxBuffer??20,
            buffer:[],

            angle:config.angle??0,

            show:config.show??true,

            remove:()=>{
                for(let i=0;i<this.element.length;i++){
                    if(this.element[i].id===id){
                        this.element[i]=null;
                    }
                }
                this.element=this.element.filter(t=>t);
            }
        }
        this.element.push(data);
        return data;
    }

    newCarProximity(config){
        const id=uuid();
        const data={
            id:id,
            type:'CarProximity',
            x:config.x??100,
            y:config.y??100,
            size:config.size??200,
            data:config.data??[0,0,0,0,0,0,0,0,0,0],
            split:config.split??4,
            color:config.color??[[256,240,128],[256,0,0]],

            show:config.show??true,
            showCar:config.showCar??true,

            sound:new warningSound(),
            minFreq:config.minFreq??1000,
            maxFreq:config.maxFreq??100,

            updata:function(data=(new Array(this.data.length).fill(0))){
                this.data=data;
                let rightMax=0;
                let leftMax=0;
                for(let i=0;i<data.length;i++){
                    if(i===0||i===data.length/2){
                        if(data[i]>rightMax){
                            rightMax=data[i];
                        }
                        if(data[i]>leftMax){
                            leftMax=data[i];
                        }
                    }else if(0<i&&i<data.length/2){
                        if(data[i]>rightMax){
                            rightMax=data[i];
                        }
                    }else if(data.length/2<i&&i<data.length){
                        if(data[i]>leftMax){
                            leftMax=data[i];
                        }
                    }
                }
                // console.log(rightMax,leftMax)
                if(rightMax<=0&&leftMax<=0){
                    this.sound.freq=-1;
                }else{
                    this.sound.panValue=((rightMax-leftMax)/(rightMax+leftMax));
                    this.sound.freq=this.minFreq-(this.minFreq-this.maxFreq)*(Math.max(rightMax,leftMax)/this.split);
                }
            },

            remove:()=>{
                for(let i=0;i<this.element.length;i++){
                    if(this.element[i].id===id){
                        this.element[i]=null;
                    }
                }
                this.element=this.element.filter(t=>t);
            }
        }
        this.element.push(data);
        return data;
    }

    newLED(config){
        const id=uuid();
        const data={
            id:id,
            type:'LED',
            x:config.x??100,
            y:config.y??100,
            size:config.size??50,
            onColor:config.onColor??' #ff0000',
            offColor:config.offColor??'rgb(64, 0, 0)',

            show:config.show??true,

            value:config.value??false,

            remove:()=>{
                for(let i=0;i<this.element.length;i++){
                    if(this.element[i].id===id){
                        this.element[i]=null;
                    }
                }
                this.element=this.element.filter(t=>t);
            }
        }
        this.element.push(data);
        return data;
    }
}

uuid = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}