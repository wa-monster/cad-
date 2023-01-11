const fs = require('fs')
const path = require('path')
const csv=require('csvtojson')
const jschardet = require('jschardet')
const iconv = require('iconv-lite')
const proj4 = require('proj4')
const toGaoDe = require('./toGaoDe')
const toBaidu = require('./toBaidu')

// 开始运行
readCSV()


// UTM转WGS84

// 读取数据
function readCSV(){
  const data = fs.readFileSync(path.resolve(__dirname,'./banan.csv'))
  const detectobj = jschardet.detect(data)
  const str = iconv.decode(data,detectobj.encoding)
  const str2 = str.replace('图层','name').replace('停车位','parkspace').replace('X 坐标','x').replace('Y 坐标','y').replace('内容','parkspace')
  tranCSV(str2)
}
// 转换csv数据
function tranCSV(str2){
  let gcj02Arr = []
  const roadInfo = diffRoadLnglat()
  csv()
  .fromString(str2)
  .then((jsonObj)=>{
    const roadObj = str2arrByRoad(jsonObj)
    
    Object.keys(roadObj).forEach((key,i)=>{
      if(key!=='308'||key!=='304'||key!=='409'||key!=='412'){
        // utm差值
        if(!roadInfo[key]){
          console.log('key',key);
        }
        const UTMDValue = transWGS842UTM(roadInfo[key].xy,roadInfo[key].lnglat)
        // console.log('UTMDValue',UTMDValue);
        const wgsArr = transUTM2WGS84(roadObj[key],UTMDValue);
        const arr2 = transWGS842GCJ02(wgsArr)
        gcj02Arr = [...gcj02Arr,...arr2]
      }
    })
    // console.log('gcj02Arr',gcj02Arr.length);
    writeFile(gcj02Arr)
  })
}
// 设置不同区域的使用坐标
function diffRoadLnglat(){
  const strRoad = '101,102,103,104,201,202,203,204,205,206,208,209,210,211,212,213,214,215,301,302,307,401,402,403,404,405,406,408,410,411,414,415,501,502,503,504,505,506,001,007,012,004,010,002,003,005,006,008,009,011,013,016,014,015'
  const areaRoad = [
    ['215','205','203','206','207'], //0
    ['201','208','202','210'], //1
    ['204'], //2
    ['209'], //3
    ['307'], //4
    ['211'], //5
    ['214'], //6
    ['212','213'], //7
    ['308'], //8
 
    ['304'],//9
    ['305','301','306','303'], //10
    ['302'], //11

    ['402','404','401','403','410','413'], //12
    ['407','406','408'],//13
    ['409','412'],//14
    ['414'],//15
    ['415'],//16
    ['405','411'],//17
    ['102','103','104','105','101'],//18
    ['001','008','007','007','009','002','004','006','005','003','010','011','013','012','015','014','016'],//19
    ['504','503'],//20
    ['506','505'],//21
    ['501','502'],//22
  ]
  const roadInfo = {}
  // 根据路段给每个路段定义不同的地图坐标点和差值
  strRoad.split(',').forEach(key=>{
    if(areaRoad[0].includes(key)){
      roadInfo[key] = {
        xy:{
          x:'2348.701',
          y:'2552.8691',
        },
        lnglat:[106.515359,29.472603]
      }
    }else if(areaRoad[1].includes(key)){
      if(key==='210'){
        roadInfo[key] = {
          xy:{
            x:'2349.3898',
            y:'2551.6576',
          },
          lnglat:[106.522654,29.461769]
        }
      }else if(key==='201'){
        roadInfo[key] = {
          xy:{
            x:'2348.8004',
            y:'2552.3145',
          },
          lnglat:[106.51666,29.467781]
        }
      }else{
        roadInfo[key] = {
          xy:{
            x:'2349.021',
            y:'2552.0524',
          },
          lnglat:[106.518555,29.465085]
        }
      }
    }else if(areaRoad[2].includes(key)){
      roadInfo[key] = {
        xy:{
          x:'2348.2793',
          y:'2551.9515',
        },
        lnglat:[106.510837,29.464374]
      }
    }else if(areaRoad[3].includes(key)){
      roadInfo[key] = {
        xy:{
          x:'2347.6768',
          y:'2551.0041',
        },
        lnglat:[106.504871,29.455724]
      }
    }else if(areaRoad[4].includes(key)){
      roadInfo[key] = {
        xy:{
          x:'2350.474',
          y:'2550.5622',
        },
        lnglat:[106.533416,29.453395]
      }
    }else if(areaRoad[5].includes(key)){
      roadInfo[key] = {
        xy:{
          x:'2351.6973',
          y:'2551.6514',
        },
        lnglat:[106.546192,29.461545]
      }
    }else if(areaRoad[6].includes(key)){
      roadInfo[key] = {
        xy:{
          x:'2352.4177',
          y:'2552.0897',
        },
        lnglat:[106.553509,29.465403]
      }
    }else if(areaRoad[7].includes(key)){
      roadInfo[key] = {
        xy:{
          x:'2352.1172',
          y:'2551.2299',
        },
        lnglat:[106.550569,29.457986]
      }
    }else if(areaRoad[8].includes(key)){
      // 表格数据中不存在  308路段
      roadInfo[key] = {}
    }else if(areaRoad[9].includes(key)){
      // 表格数据中不存在  304路段
      roadInfo[key] = {}
    }else if(areaRoad[10].includes(key)){
      roadInfo[key] = {
        xy:{
          x:'2351.7508',
          y:'2549.2691',
        },
        lnglat:[106.546638,29.440059]
      }
    }else if(areaRoad[11].includes(key)){
      roadInfo[key] = {
        xy:{
          x:'2351.35',
          y:'2547.7943',
        },
        lnglat:[106.542365,29.426807]
      }
    }else if(areaRoad[12].includes(key)){
      roadInfo[key] = {
        xy:{
          x:'2350.97',
          y:'2545.4325',
        },
        lnglat:[106.538229,29.405495]
      }
    }else if(areaRoad[13].includes(key)){
      roadInfo[key] = {
        xy:{
          x:'2350.9699',
          y:'2544.108',
        },
        lnglat:[106.53854,29.393605]
      }
    }else if(areaRoad[14].includes(key)){
       // 表格数据中不存在  409路段 412 路段
       roadInfo[key] = {}
    }else if(areaRoad[15].includes(key)){
      roadInfo[key] = {
        xy:{
          x:'2351.8092',
          y:'2543.2753',
        },
        lnglat:[106.547552,29.385939]
      }
    }else if(areaRoad[16].includes(key)){
      roadInfo[key] = {
        xy:{
          x:'2351.7116',
          y:'2542.4791',
        },
        lnglat:[106.547552,29.385939]
      }
    }else if(areaRoad[17].includes(key)){
      roadInfo[key] = {
        xy:{
          x:'2350.5518',
          y:'2541.7704',
        },
        lnglat:[106.534173,29.372289]
      }
    }else if(areaRoad[18].includes(key)){
      code:'103062',
      roadInfo[key] = {
        xy:{
          x:'2347.8941',
          y:'2543.7821',
        },
        lnglat:[106.507058,29.390548]
      }
    }else if(areaRoad[19].includes(key)){
      roadInfo[key] = {
        code:'006001',
        xy:{
          x:'2349.0952',
          y:'2542.939',
        },
        lnglat:[106.519417,29.3832]
      }
    }else if(areaRoad[20].includes(key)){
      roadInfo[key] = {
        code:'503003',
        xy:{
          x:'2358.6477',
          y:'2551.7814',
        },
        lnglat:[106.618002,29.462549]
      }
    }else if(areaRoad[21].includes(key)){
      roadInfo[key] = {
        code:'506030',
        xy:{
          x:'2359.6739',
          y:'2550.7535',
        },
        lnglat:[106.628393,29.453524]
      }
    }else if(areaRoad[22].includes(key)){
      roadInfo[key] = {
        code:'501086',
        xy:{
          x:'2359.8007',
          y:'2551.9935',
        },
        lnglat:[106.629808,29.464637]
      }
    }
  })
  return roadInfo
}
// 字符串根据路段分割
function str2arrByRoad(jsonObj){
  const roadObj = {}
  jsonObj.forEach((v,i)=>{
    if(v.parkspace){
      // 获取数字
      let parkCode = replaceStr(v.parkspace,/\d+/g,'parkCode',i) 
      // if(parkCode.length>4){
      //   console.log('parkCode',v.parkspace);
      // }
      parkCode = parkCode.length>4 ? parkCode :'no-number'
      if(parkCode !== 'no-number'){
        let roadName = replaceStr(parkCode,/\d\d\d/,'roadName',i) 
        // if(roadName=== '016'){
        //   console.log('v.parkspace',v.parkspace);
        // }
        if(roadObj[roadName]){
          roadObj[roadName].push(v)
        }else{
          roadObj[roadName] = [v]
        }
      }
    }
  })
  return roadObj
}
// 根据参数截取字符
function replaceStr(str,reg,varName='结果',i){
  const arr = str.match(reg)
  if(arr){
    return arr [0]
  }else{
    // console.log('str',str,reg,arr,'第'+i+'多少号');
    // throw Error(varName+'是null')
    return 'no-number'
  }
}
// UTM转WGS84
function transUTM2WGS84(jsonObj,UTMDValue){
  const wgsArr = JSON.parse(JSON.stringify(jsonObj))
  wgsArr.forEach((v)=>{
    const xStr = (Number(v.x)*1000 +UTMDValue.x)
    const yStr = (Number(v.y)*1000 +UTMDValue.y)
    const arr = proj4(
      "+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs +type=crs",
      "+proj=longlat +datum=WGS84 +no_defs +type=crs",
      [Number(xStr), Number(yStr)]
    );
    v.x = arr[0]
    v.y = arr[1]
  })
  return wgsArr
}
// WGS84转UTM
function transWGS842UTM(xy,lnglat){
  const arr = proj4(
    "+proj=longlat +datum=WGS84 +no_defs +type=crs",
    "+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs +type=crs",
    lnglat
  )
  // console.log(xy,arr,lnglat);
  const obj = {
    x:arr[0]-(xy.x*1000),
    y:arr[1]-(xy.y*1000)
  }
  return obj
}
//WGS84转GCJ02
function transWGS842GCJ02(wgsArr){
  wgsArr.forEach((v)=>{
    const lnglat = toGaoDe.wgs84togcj02(v.y,v.x)
    v.x = lnglat[1]
    v.y = lnglat[0]
  })
  return wgsArr
}
// 数据写入文件
function writeFile(data){
  fs.writeFileSync(`车位经纬度${Date.now()}.json`,JSON.stringify(data))
}
// 转百度BD09
function wgs2BD(data){
  data.forEach(v=>{
    const res = toBaidu.GpsToBaiduPoints([{y:106.54191399947209, x:29.42964000726335}])
    v.y = arr[0][0]
    v.x = arr[0][1]
  })
}


