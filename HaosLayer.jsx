if (!app.documents.length > 0) { //--если нет активных документов
 alert('Нет документа для работы!');
 complete ();
} else {
	app.preferences.rulerUnits = Units.PIXELS;
	app.preferences.typeUnits = TypeUnits.PIXELS;
	var _docRef = app.activeDocument;  //-- получили документ, в котором работаем
 	var _layers=_docRef.artLayers; //-- получили набор слоёв
     _docRef.suspendHistory('ChaosLayers', 'Init()'); //-- Что бы в истории вместо кучи действий было только одно это
}	

/**
* Округляем в верх. 
*/
function roundD(n)  {
    return Math.round(n);    //-- Уже просто округляем =)
}

/**
 *  Изменяем размер текущего слоя
 *  Так как маштабирование  в шопе идёт в процентах, придётся их вычислить
 */
function resizeActiveLayer(Width , Height, Constrain) {
    var LB = activeDocument.activeLayer.bounds;
    var lWidth = 100/(LB[2].value - LB[0].value);
    var lHeight =100/(LB[3].value - LB[1].value);
    var NewWidth = lWidth * Width;
    var NewHeight = lHeight * Height;
    if(Constrain) NewHeight = NewWidth;
    _docRef.activeLayer.resize(Number(NewWidth),Number(NewHeight),AnchorPosition.MIDDLECENTER); 
 }

/**
* Выбираем рандомное число из интервала
*/
function randomIntFromInterval(min,max) { 
    return Math.floor(Math.random()*(max-min+1)+min);
}

/**
 * Массиво-мешалка
 */
function shuffle(array) {
    var m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

/**
 * Основная магия
 */
function Init() {
    //-- по скольким столбцам и строкам распределять
    var rows = 15;
    var columns = 19; 
    var spacingX=50; //-- Расстояние между объектами по горизонтали 
    var spacingY=50;  //-- и вертикале   
    //-- Узнаем размер документа в пикс.
    var dW = _docRef.width.value;
    var dH = _docRef.height.value;
    //-- Вычислим размер каждого элемента  с учётом расстояний между ними
    var itemW= roundD(dW/columns - spacingX/2)  ;
    var  itemH = roundD(dH/rows - spacingY/2);
    //-- Занесём все слои в массив. Да, можно и напрямую, но вдруг потребуется дополнительная выборка, например по именам.
    var layers=new Array();       
    for(var i=0,  _layers=_docRef.artLayers; i<_layers.length; i++) { 
        if (_layers[i].isBackgroundLayer) continue; //-- исключаем фоновый слой
        layers.push(_layers[i]);        
    }
    //-- Отмаштабируем все слои до нужного размера
    for (i=0; i<layers.length; i++)  {
        _docRef.activeLayer=layers[i];
        _docRef.activeLayer.visible=true; //-- Иначе со скрытыми слояим ничего делать нельзя 
        resizeActiveLayer(itemW, itemH, true);
    }
    //-- Создади новую группу для слоёв, что бы не перемешивать с исходными
    resultLayerSet=_docRef.layerSets.add();    
    resultLayerSet.name='Результат'; 
    //-- создадим массив со значениями от 0 до кол-ва элементов и перемешаем их - для выборки рандома без повторений
    var randArray=new Array(); 
    for (i=0; i<layers.length; i++) {
        randArray[i]=i;
    }      
    randArray=shuffle(randArray);
    //-- рандомно позиционируем и вращаем
    var rx=0, ry=0;
    var l=0;
    var i, j, dLayer, rLayer, _px, _py;
    
    for (var i=0; i<rows; i++) {
        for (var j=0; j<columns; j++) {     
           rLayer=layers[randArray[l]];
           l=(l+1<layers.length)? (l+1) : 0;
           _px=-rLayer.bounds[0];  //-- Позиционирование в шопе - относительное. Отсчёт ведётся с левого верхнего угла.
           _py=-rLayer.bounds[1];
           dLayer=rLayer.duplicate();
           dLayer.translate(rx+_px, ry+_py);	//-- Поэтому нам надо перевести из относительного смещения в абсолютное	
           dLayer.rotate(randomIntFromInterval(-30, 30));
		  dLayer.moveToEnd(resultLayerSet);               
           rx+=itemW+spacingX/2;
        }
        rx=0;
        ry+=itemH+spacingY/2;
        randArray=shuffle(randArray); //-- ещё разик перемешаем по-приколу
    }
     //-- Скроем все исходные слои
    for (i=0; i<layers.length; i++)  {
       layers[i].visible=false;
    }
    
    complete();
 }


/**
* Выполнение завершено, приберём за собой.
*/
function complete() {
    //TODO: Вернуть настройки как были
}