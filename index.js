var express = require('express');
var dicomParser = require('dicom-parser');
var Rusha = require('rusha');
var fs = require('fs');
var filePath = process.argv[2] || 'CT-RDSR-Toshiba_DoseCheck.dcm'
var app = express();
var TAG_DICT = require('./dictionary'); 
function sha1(buffer, offset, length) {
    offset = offset || 0;
    length = length || buffer.length;
    var subArray = dicomParser.sharedCopy(buffer, offset, length);
    var rusha = new Rusha();
    return rusha.digest(subArray);
  }
  

  //ContentSequence (x0040a730)

  
let getUpperPathByKey=function(data_json,path,key){
  let keys=Object.keys(data_json)
  let p=1
  //console.log('keys',keys)
  if(keys.length==0){
    return path
  }
  keys.forEach(item_key=>{
    if(item_key==key){
      p*=0
    }else{
      p*=1
    }
  })
  if(p==0){
    if(path==''){
      path+=key
    }else{
      path+='.'+key
    }
    return path
  }
  if(p==1){
    if(data_json.elememts){
      let elements=data_json.elememts
      for(let index=0;index<elements.length;index++){
        let element=elements[index]
        if(path==''){
          path+=index
        }else{
          path+='.'+index
        }
        let temp_path=getUpperPath(element,path,key)
        if(path!=temp_path){
          path=temp_path
          break;
        }
      }
          
      return path
    }else{
      return path
    }
  }
}

let getUpperPathByValue=function(data_json,path,value){
  let string_value=JSON.stringify(value)
  let keys=Object.keys(data_json)
  let p=1
  //console.log('keys',keys)
  if(keys.length==0){
    return path
  }
  let key=''
  keys.forEach(item_key=>{
    if(data_json[item_key]==value){
      key=item_key
      p*=0
    }else{
      p*=1
    }
  })
  if(p==0){
    if(path==''){
      path+=key
    }else{
      path+='.'+key
    }
    return path
  }
  if(p==1){
    if(data_json.elememts){
      let elements=data_json.elememts
      for(let index=0;index<elements.length;index++){
        let element=elements[index]
        if(path==''){
          path+='elememts'+index
        }else{
          path+='.elememts'+index
        }
        let temp_path=getUpperPathByValue(element,path,value)
        if(path!=temp_path){
          path=temp_path
          break;
        }
      }
      return path
    }else{
      return path
    }
  }
}

let saveToDB = function(temp_data){
  // let ct_data={
  //    facility:temp_data.x00080050,
  //    study_date:new Date(),
  //    model:temp_data.x00081090,
  //    station:temp_data.x00080030,
  //   //  paitent_sex:temp_data.x00100040,
  //    protocol_name:temp_data.x00080070,
  //    study_description:temp_data.x00080080,
  //    mapped_protocol:temp_data.x00080081,
  //    ctdi:null,
   
  // }
  let ct_data = {
     AcessionNumber:temp_data.x00080050,
     StudyDate:temp_data.x00080020,
     StudyTime:temp_data.x00080030,
     Manufacturer:temp_data.x00080070,
     InstitutionName:temp_data.x00080080,
     InstitutionAddress:temp_data.x00080081,
     StationName:temp_data.x00081010,
     StudyDescription:temp_data.x00081030,
     InstitutionalDepartmentName:temp_data.x00081040,
     ProtocolName:temp_data.x00181030,
     ManufacturerModelName:temp_data.x00081090,
     PatientID:temp_data.x00100020,
     PatientAge:temp_data.x00101010,
     DeviceSerialNumber:temp_data.x00181000,
     StudyInstanceUID:temp_data.x0020000d,
     SeriesInstanceUID:temp_data.x0020000e,
     AcquisitionProtocol:temp_data.elememts[7],
     TotalDLP:temp_data.elememts[6].elememts[1].elememts[0].x0040a30a

  }
 
  return ct_data;
}




    let dcmToJson=function (dataSet){
      let result_json={}
      let keys=Object.keys(dataSet.elements)
      keys.forEach((key,index)=>{
        if(dataSet.elements[key].items==undefined){
          let temp=dataSet.string(key)
          result_json[key]=temp
        }else{
          let temp_items=dataSet.elements[key].items
          result_json.elememts=[]
          temp_items.forEach(item=>{
            result_json.elememts.push(dcmToJson(item.dataSet))
          })
        }
      })
      return result_json
    }

  let readFile=function (path=''){
  
    var dicomFileAsBuffer = fs.readFileSync(filePath);
    var dataSet = dicomParser.parseDicom(dicomFileAsBuffer);
    let result =dcmToJson(dataSet);


   console.log("result=>",result)
  }
  readFile('CT-RDSR-Toshiba_DoseCheck.dcm')

app.listen(5001,()=>{
    console.log('Listening 5001port');
});