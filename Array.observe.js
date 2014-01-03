;(function(){
/*
 * =genObservableArrayItem
 * @about   set observableArray item
 * */
function genObservableArrayItem(originArray, observableArray, callback, i){
    var obj         = {};
    obj[i]          = originArray[i];
    try{
        Object.defineProperty(obj,i,Object.getOwnPropertyDescriptor(observableArray, i));
    }catch(e){}
    (function(originArray, observableArray, callback, i){
        Object.defineProperty(observableArray,i,{//[i]
            get: function(){//get [i]
                return obj[i];
            },
            set: function(value){//set [i]
                var oldValue    = originArray[i];
                originArray[i]  = value;
                if(obj[i] != value){
                    obj[i]          = value;
                    callback.call(observableArray,{
                        "name"      : Number(i),
                        "object"    : observableArray,
                        "type"      : "updated",
                        "oldValue"  : oldValue,
                        "value"     : value
                    })
                }
            },
            configurable    : true,//delete command will failed, because delete command still can't be detect, and set item to undefined is equal to delete command
            enumerable      : true
        });
    })(originArray, observableArray, callback, i)
}
/*
 * =ArrayObserve
 * @usage   observe array obj[prop]
 * */
//observalbleArray prototype
function ObservableArrayPrototype(){
    var fallback        = this,
        fallbackGetter  = function(){},
        fallbackSetter  = function(i,value){//new item is created
            var observableArray = this,
                originArray     = observableArray.__originArray__,
                callback        = observableArray.__callback__;
            try{
                Object.defineProperty(observableArray, 'length',{
                    get: function(){ return originArray.length },
                    set: function(value){
                        //sync originArray and array hook
                        var originLength    = originArray.length;
                        if(originLength > value){//delete
                            var p1  = 0,
                                p2  = 0,
                                result  = [],
                                i,len,oldValue;
                            while(p1<originArray.length){
                                if(originArray[p1] == observableArray[p2]){
                                    p1++;
                                    p2++;
                                }else{
                                    result.push(p1);
                                    p1++;
                                }
                            }
                            console.log(result)
                            for(i=0,len=result.length; i<len; i++){
                                index       = result[i];
                                oldValue    = originArray[index];
                                originArray.splice(index,1);
                                delete observableArray[index];//prepare for new
                                callback.call(observableArray,{
                                    "name"      : index,
                                    "object"    : observableArray,
                                    "type"      : "deleted",
                                    "oldValue"  : oldValue
                                })
                            }
                            originArray.splice(index,1);
                        }
                    }
                })
            }catch(e){}
            //storage origin descriptor
            //property descriptor chain
            //set origin Array
            originArray[i]  = value;
            genObservableArrayItem(originArray, observableArray, callback, i);
            //notice new
            callback.call(observableArray,{
                "name"      : Number(i),
                "object"    : observableArray,
                "type"      : "new",
                "value"     : value
            });
        };
    //console.time('[i]')
    //duff is use for large number process which is equal to this
    //for(var i= 0; i<MAX; i++){
    //    (function(i){//process})(i)
    //}
    /*
     * Fast Duff's Device
     * @author Miller Medeiros <http://millermedeiros.com>
     * @modify Defims Loong
     * @version 0.3 (2010/08/25)
     */
    (function(process, iterations){
        var n   = iterations % 8,
            i   = iterations;
        while (n--) process(i--);
        n = (iterations * 0.125) ^ 0;
        while (n--) {
            process(i--);
            process(i--);
            process(i--);
            process(i--);
            process(i--);
            process(i--);
            process(i--);
            process(i--);
        };
    })(function(i){
        Object.defineProperty(fallback,i-1,{//[i] fallback
            get             : fallbackGetter,
            set             : function(value){//fallback setter
                fallbackSetter.call(this, i-1, value)
            },
            configurable    : false,
            enumerable      : false
        });
    }, 13);
    //console.timeEnd('[i]')
    //to normal array
    fallback.toNormalArray   = function(){
        var observableArray = this,
            len             = observableArray.length,
            result          = [],
            i;
        for(i=0; i<len; i++) result.push(observableArray[i]);
        return result
    }
    //fixed concat
    fallback.concat  = function(){
        return [].concat.apply(this.toNormalArray(),arguments);
    }

}
//ObservableArrayPrototype -> Array.prototype
ObservableArrayPrototype.prototype      = Array.prototype;
ObservableArrayPrototype.constructor    = Array;
//ObservableArray
function ObservableArray(originArray, callback){
    this.__originArray__  = originArray;
    this.__callback__     = callback;
    //init originArray
    var len             = originArray.length,
        observableArray = this;
    while(len--) genObservableArrayItem(originArray, observableArray, callback, len);
    observableArray.length  = originArray.length;
}

//ObservableArray -> ObservableArrayPrototype
ObservableArray.prototype   = new ObservableArrayPrototype;
ObservableArray.constructor = ObservableArrayPrototype;
//ArrayObserve
function ArrayObserve(obj, prop, callback){
    //replace origin array with observable Array
    var originArray     = obj[prop],
        observeArray    = new ObservableArray(originArray, callback);
    obj[prop]   = observeArray;
    return observeArray
}

window.ArrayObserve = ArrayObserve;
})()
/*test*
var obj = {
    arr : [],
    arr1: [1,2,3]
};
//ArrayObserve(obj, 'arr', function(change){
//    console.log(change)
//});
ArrayObserve(obj, 'arr1', function(change){
    console.log(change,'arr1')
});
console.log(obj.arr1);
//obj.arr = [10,20]
//obj.arr.push('first:');
//obj.arr.push('second:');
//obj.arr.push('third:');
//obj.arr.pop();
//obj.arr.unshift('forth:');
//obj.arr.shift();
//obj.arr[1]  ='modify';
//obj.arr[10] ='modify';
obj.arr1[3] = 'arr1 3';
obj.arr1[3] = 'modify';
obj.arr1[3] = 'modify';
obj.arr1[4] = 'arr1 4';
//obj.arr1.pop();
//storage origin descriptor
//var _obj     = {};
//console.log(obj.arr1);
//property descriptor chain
//console.log(obj.arr1, _obj, Object.getOwnPropertyDescriptor(obj.arr1.prototype, 0));
//try{
//    Object.defineProperty(_obj,0,Object.getOwnPropertyDescriptor(obj.arr1.prototype, 0)||{});
//}catch(e){}
//Object.defineProperty(obj.arr1, '0', {
//    get : function(){
//        console.log('*get');
//        return _obj[0]
//    },
//    set : function(value){
//        console.log('*set');
//        _obj[0] = value;
//    }
//});
//obj.arr1[0] = 'oo';
/**/
