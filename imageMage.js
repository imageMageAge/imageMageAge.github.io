var imageInput = document.getElementById('imageInput');
var imageContainer = document.getElementById('imageContainer');
var pixelColors = document.getElementById('pixelColors');
var newImageContainer = document.getElementById('newImageContainer');
var originalImage;
var clickXPosition;
var clickYPosition;
var visualizationChoiceMenu = document.getElementById('visualizationChoice');
var visualizationChoice = visualizationChoiceMenu.value;
var previousVisualizationChoice = visualizationChoice;
var loadingScreen = document.getElementById("coverScreen");

var redInput = document.getElementById('red');
var greenInput = document.getElementById('green');
var blueInput = document.getElementById('blue');
var alphaInput = document.getElementById('alpha');

var smearWidthInput = document.getElementById('smearWidth');
var smearWidth = smearWidthInput.value;
var chosenPixelInput = document.getElementById('chosenPixel');
var chosenPixel = chosenPixelInput.value;

var noiseProbabilityInput = document.getElementById('noiseProbability');
var noiseProbability = noiseProbabilityInput.value;

var noiseColorRangeInput = document.getElementById('noiseColorRange');
var noiseColorRange = noiseColorRangeInput.value;
var rgbColorRange = noiseColorRange/100 * 255;

var dotSizeFactorInput = document.getElementById('dotSizeFactor');
var dotSizeFactor = dotSizeFactorInput.value;

var lightnessLevelInput = document.getElementById('lightnessLevel');
var lightnessLevel = lightnessLevelInput.value;

var saturationLevelInput = document.getElementById('saturationLevel');
var saturationLevel = saturationLevelInput.value;

var isImageLoaded = false;

var redrawButton = document.getElementById('generate-button');
redrawButton.addEventListener('click', refresh);

var actualWidth;
var actualHeight;
var scaledWidth;
var scaledHeight;
var widthScalingRatio;

var newCanvas = document.createElement('canvas');
var newCtx = newCanvas.getContext('2d');

var pixelData;
var pixels;

var redShift = redInput.value;
var greenShift = greenInput.value;
var blueShift = blueInput.value;
var alphaShift = alphaInput.value;

var screenWidth = window.innerWidth; // get the width of the browser screen
var maxImageWidth = (screenWidth*0.96) / 2; // max width for each of the two images
var maxImageHeight = window.innerHeight * 0.78;
console.log("max image dimensions: "+maxImageWidth+", "+maxImageHeight);

//color pickers
var paletteChoiceInput = document.getElementById('paletteChoice');
var colorPicker = document.getElementById('color-picker');
var colorPicker2 = document.getElementById('color-picker2');
var colorPicker3 = document.getElementById('color-picker3');
var colorPicker4 = document.getElementById('color-picker4');
var colorPicker5 = document.getElementById('color-picker5');
var colorPicker6 = document.getElementById('color-picker6');
var pickers = [colorPicker, colorPicker2, colorPicker3, colorPicker4, colorPicker5, colorPicker6];

var backgroundColorInput = document.getElementById('backgroundColorInput');
var backgroundColor = backgroundColorInput.value;

var palettePresets = [
    {name: "mage", displayName: "Mage", palette: ["#0066A4","#640000","#006400","#FFC300","#FFFFFF","#000000"]},
    {name: "viridis", displayName: "Viridis", palette: ["#fde725","#7ad151","#22a884","#2a788e","#414487","#440154"]},
    {name: "analog", displayName: "Analog", palette: ["#d27575","#675a55","#529b9c","#9cba8f","#eac392","#FFFFFF"]},
    {name: "inferno", displayName: "Inferno", palette: ["#fcffa4","#fca50a","#dd513a","#932667","#420a68","#000004"]},
    {name: "vaporwave", displayName: "Vaporwave", palette: ["#D336BE","#E1A5EE","#05C3DD","#1E22AA","#D1EFED","#FFFFFF"]},
    {name: "bohemian", displayName: "Bohemian", palette: ["#3F2021","#B04A5A","#BA5B3F","#CB9576","#7FA0AC","#EEE5D3"]},
    {name: "earth", displayName: "Earth", palette: ["#8e412e","#ba6f4d","#e6cebc","#a2a182","#687259","#123524"]},
    {name: "primary", displayName: "Primary", palette: ["#c90000","#fff400","#0004ff","#ffffff","#ffffff","#000000"]},
    {name: "custom", displayName: "Custom >>", palette: ["#FFFFFF","#DDDDDD","#BBBBBB","#000000","#000000","#000000"]}
];

var chosenPalette = palettePresets[0].palette;

//set as equal to mage palette upon first load, in RGB space
var chosenPaletteRGBValues = [
    [0, 102, 164],
    [100, 0, 0],
    [0, 100, 0],
    [255, 195, 0],
    [255, 255, 255],
    [0, 0, 0]
];

//fill the paletteChoice HTML element dynamically
palettePresets.forEach((preset) => {
    const option = document.createElement('option');
    option.value = preset.name;
    option.text = preset.displayName;
    paletteChoiceInput.appendChild(option);
});

var paletteChoice = paletteChoiceInput.value;

//dual color picker
var dualColorPicker1 = document.getElementById('dualColorInput1');
var dualColorPicker2 = document.getElementById('dualColorInput2');

var dualColor1 = dualColorPicker1.value;
var dualColor2 = dualColorPicker2.value;

//Pop-up for grid visual style
var popup = document.querySelector('.popup');

// hide the popup when the user clicks on the image
popup.addEventListener('click', () => {
    popup.style.display = 'none';
});

var drawImageCounter = 0;
var gridLoadCounter = 0;
var ringsLoadCounter = 0;
var frontierLoadCounter = 0;
var eclipseLoadCounter = 0;

//Save and export the new image in png format
var saveButton = document.getElementById('save-image-button');

saveButton.addEventListener('click', () => {
    saveImage();
});


// Add event listeners to the input boxes
imageInput.addEventListener('change', readSourceImage);

visualizationChoiceMenu.addEventListener('change',refresh);
redInput.addEventListener('change', refresh);
greenInput.addEventListener('change', refresh);
blueInput.addEventListener('change', refresh);
alphaInput.addEventListener('change', refresh);
smearWidthInput.addEventListener('change', refresh);
chosenPixelInput.addEventListener('change', refresh);
noiseProbabilityInput.addEventListener('change', refresh);
noiseColorRangeInput.addEventListener('change', refresh);
dotSizeFactorInput.addEventListener('change', refresh);

paletteChoiceInput.addEventListener('change', changePalette);
dualColorPicker1.addEventListener('change', refresh);
dualColorPicker2.addEventListener('change', refresh);
lightnessLevelInput.addEventListener('change', refresh);
saturationLevelInput.addEventListener('change', refresh);


//main method
initPhotoCarousel();
getUserInputs();
initColorPickers();
showDefaultImage();

// Grab new user inputs from control menu
function getUserInputs() {

    visualizationChoice = String(visualizationChoiceMenu.value);

    redShift = parseInt(redInput.value);
    greenShift = parseInt(greenInput.value);
    blueShift = parseInt(blueInput.value);
    alphaShift = parseFloat(alphaInput.value);

    smearWidth = Math.min(100,Math.max(0,Number(smearWidthInput.value)));
    chosenPixel = Math.min(100,Math.max(0,Number(chosenPixelInput.value)));
    noiseProbability = Math.min(100,Math.max(0,Number(noiseProbabilityInput.value)));
    noiseColorRange = Math.min(100,Math.max(0,Number(noiseColorRangeInput.value)));
    dotSizeFactor = Math.min(100,Math.max(0,Number(dotSizeFactorInput.value)));

    rgbColorRange = noiseColorRange/100 * 255;

    dualColor1 = dualColorPicker1.value;
    dualColor2 = dualColorPicker2.value;

    lightnessLevel = Math.min(100,Math.max(0,Number(lightnessLevelInput.value)));
    saturationLevel = Math.min(100,Math.max(0,Number(saturationLevelInput.value)));

    //set background color
    if(visualizationChoice == previousVisualizationChoice){
        backgroundColor = backgroundColorInput.value;
    } else if(visualizationChoice == "eclipse"){
        backgroundColorInput.value = "#000000";
        backgroundColor = "#000000";
    } else {
        backgroundColorInput.value = "#FFF9EB";
        backgroundColor = "#FFF9EB";
    }

    toggleInputMenu();
}

function toggleInputMenu(){

    var numColumns = 12;

    //columns: Style, RGBA shift, Smear, Sensitivity, Color Range, Max Dot Size, Palette, Color pickers, Background, dual color picker
    //Value of 1 if the columnn should be shown for that style, 0 if hidden
    var menuControlFlags = [
        {menuOptions: [1,0,0,0,1,1,0,0,0,0,0,0], name: "pointillist"},
        {menuOptions: [1,0,0,1,0,0,0,0,0,0,0,0], name: "sketch"},
        {menuOptions: [1,0,0,1,0,0,0,0,0,0,0,0], name: "roller"},
        {menuOptions: [1,0,0,1,0,0,1,1,0,0,0,0], name: "palletize"},
        {menuOptions: [1,0,0,1,0,0,0,0,0,0,0,0], name: "pixel"},
        {menuOptions: [1,0,0,1,0,0,0,0,1,0,0,0], name: "clippings"},
        {menuOptions: [1,0,0,1,0,0,0,0,0,0,0,0], name: "grid"},
        {menuOptions: [1,0,0,1,0,0,1,1,0,0,0,0], name: "mondrian"},
        {menuOptions: [1,0,0,1,0,1,0,0,1,0,0,0], name: "rings"},
        {menuOptions: [1,0,0,1,0,0,0,0,1,0,0,0], name: "gumball"},
        {menuOptions: [1,0,0,1,0,0,0,0,0,0,0,0], name: "noisySort"},
        {menuOptions: [1,0,0,1,0,0,0,0,0,0,0,0], name: "void"},
        {menuOptions: [1,0,0,1,0,0,0,0,1,0,0,0], name: "braille"},
        {menuOptions: [1,0,0,1,0,0,1,1,0,0,0,0], name: "dust"},
        {menuOptions: [1,0,0,1,0,0,0,0,0,1,0,0], name: "outlines"},
        {menuOptions: [1,0,0,1,0,0,0,0,1,0,0,0], name: "frontier"},
        {menuOptions: [1,0,0,1,0,0,0,0,1,0,0,0], name: "eclipse"},
        {menuOptions: [1,0,0,0,0,0,0,0,1,0,1,1], name: "satLight"},
        {menuOptions: [1,0,0,1,0,0,0,0,1,1,0,0], name: "edgy"},
        {menuOptions: [1,0,0,1,0,0,0,0,0,0,0,0], name: "shadow"},
    ];

    var styleIndex = menuControlFlags.findIndex(obj => obj.name == visualizationChoice);

    for(var idx=0; idx<numColumns; idx++){
        var className = ".inputCol"+(idx+1);
        var elements = document.querySelectorAll(className);
        elements.forEach(element => {
            if(menuControlFlags[styleIndex].menuOptions[idx] == 1){
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
    }
    
}

function showDefaultImage() {
    
    var defaultImage = new Image();
    defaultImage.src = 'images/HK2024.jpg';

    defaultImage.onload = () => {

        actualWidth = defaultImage.width;
        actualHeight = defaultImage.height;

        //adjust for max width
        if(actualWidth >= maxImageWidth){
        scaledWidth = maxImageWidth;
        } else{
        scaledWidth = Math.min(maxImageWidth,actualWidth*1.0);
        }

        widthScalingRatio = scaledWidth / actualWidth;
        scaledHeight = actualHeight * widthScalingRatio;

        //adjust for max height
        if(scaledHeight > maxImageHeight){
            scaledWidth = (maxImageHeight / scaledHeight) * scaledWidth;
            widthScalingRatio = scaledWidth / actualWidth;
            scaledHeight = actualHeight * widthScalingRatio;
        }

        newCanvas = document.createElement('canvas');
        newCtx = newCanvas.getContext('2d');

        newCanvas.width = actualWidth;
        newCanvas.height = actualHeight;

        newCtx.drawImage(defaultImage, 0, 0);

        const newImageData = newCanvas.toDataURL();
        const newImage = new Image();
        newImage.src = newImageData;
        newImage.style.width = `${scaledWidth}px`;
        imageContainer.appendChild(newImage);

        var img = imageContainer.querySelector('img');

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = actualWidth;
            canvas.height = actualHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            pixelData = ctx.getImageData(0, 0, actualWidth, actualHeight);
            pixels = pixelData.data;
            isImageLoaded = true;
            drawNewImage();

            img.addEventListener('click', (e) => {
                clickXPosition = e.offsetX / widthScalingRatio;
                clickYPosition = e.offsetY / widthScalingRatio;
                console.log(`Clicked at (${clickXPosition}, ${clickYPosition})`);
                if(visualizationChoice=="grid" || visualizationChoice=="rings" || visualizationChoice=="frontier"){
                    drawNewImage();
                }
            });

            window.scrollTo(0, 0);
        }

    }
}

function readSourceImage(){

//remove any existing images
while (imageContainer.firstChild) {
    imageContainer.removeChild(imageContainer.firstChild);
}

while (newImageContainer.firstChild) {
    newImageContainer.removeChild(newImageContainer.firstChild);
}

//read image file      
  var file = imageInput.files[0];
  var reader = new FileReader();
  reader.onload = (event) => {
    var imageData = event.target.result;
    var image = new Image();
    image.src = imageData;
    image.onload = () => {
      
        actualWidth = image.width;
        actualHeight = image.height;
            
        //adjust for max width
        if(actualWidth >= maxImageWidth){
            scaledWidth = maxImageWidth;
        } else{
            scaledWidth = Math.min(maxImageWidth,actualWidth*2);
        }

        widthScalingRatio = scaledWidth / actualWidth;
        scaledHeight = actualHeight * widthScalingRatio;

        //adjust for max height
        if(scaledHeight > maxImageHeight){
            scaledWidth = (maxImageHeight / scaledHeight) * scaledWidth;
            widthScalingRatio = scaledWidth / actualWidth;
            scaledHeight = actualHeight * widthScalingRatio;
        }

        var originalImg = document.createElement('img');
        originalImg.src = imageData;
        originalImg.width = scaledWidth;
        originalImg.height = scaledHeight;
        imageContainer.appendChild(originalImg);

        // Get the pixel colors
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = actualWidth;
        canvas.height = actualHeight;
        ctx.drawImage(image, 0, 0);
        pixelData = ctx.getImageData(0, 0, actualWidth, actualHeight);
        pixels = pixelData.data;

        //add click position event listener
        originalImg.addEventListener('click', (e) => {
            clickXPosition = e.offsetX / widthScalingRatio;
            clickYPosition = e.offsetY / widthScalingRatio;
            console.log(`Clicked at (${clickXPosition}, ${clickYPosition})`);
            if(visualizationChoice=="grid" || visualizationChoice=="rings" || visualizationChoice=="frontier"){
                drawNewImage();
            }
        });

        refresh();

    };
  };
  reader.readAsDataURL(file);

  isImageLoaded = true;

}

function refresh(){

    console.log("refresh");

    //show the loading screen
    loadingScreen.classList.remove("hidden");
    loadingScreen.classList.add("lockOn");

    getUserInputs();
    setTimeout(drawNewImage,5);

}

function drawNewImage(){

    if (!isImageLoaded) {
        //hide the loading screen
        loadingScreen.classList.remove("lockOn");
        loadingScreen.classList.add("hidden");
        return; // exit the function if isImageLoaded is false
    }

    //remove any existing new images
    while (newImageContainer.firstChild) {
        newImageContainer.removeChild(newImageContainer.firstChild);
    }

    originalImage = imageContainer.querySelector('img');

    // Create a new image
    newCanvas = document.createElement('canvas');
    newCtx = newCanvas.getContext('2d');

    newCanvas.width = actualWidth;
    newCanvas.height = actualHeight;

    //set background color of new canvas
    newCtx.fillStyle = backgroundColor;
    newCtx.fillRect(0, 0, actualWidth, actualHeight);

    console.log("actual width: "+actualWidth);
    console.log("actual height: "+actualHeight);

    drawImageCounter++;

    if(visualizationChoice == "rgba"){
        console.log("running rgba visual");
        for (let j = 0; j < pixels.length; j += 4) {
            const newRed = pixels[j] * (redShift/100);
            const newGreen = pixels[j + 1] * (greenShift/100);
            const newBlue = pixels[j + 2] * (blueShift/100);
            const newAlpha = pixels[j + 3] * (alphaShift/100);
            newCtx.fillStyle = `rgba(${newRed}, ${newGreen}, ${newBlue}, ${newAlpha})`;
            newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
        }
    } else if(visualizationChoice == "smear"){
        console.log("running smear visual");
        for (let j = 0; j < pixels.length; j += 4) {
            var currentColNum = j / 4 % actualWidth;
            var currentRowNum = Math.floor(j / 4 / actualWidth);
            var currentRightPixel = (Math.floor(actualWidth * chosenPixel/100) + (actualWidth*currentRowNum))-1;

            var newRed = pixels[currentRightPixel*4];
            var newGreen = pixels[currentRightPixel*4+1];
            var newBlue = pixels[currentRightPixel*4+2];
            var newAlpha = 1;
            if(currentColNum < (actualWidth * smearWidth/100)){
                newAlpha = pixels[currentRightPixel*4+3];
            } else {
                newAlpha = 0;
            }
            newCtx.fillStyle = `rgba(${newRed}, ${newGreen}, ${newBlue}, ${newAlpha})`;
            newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
        }
    } else if(visualizationChoice == "roller"){
        console.log("running roller visual");

        //faithful reproduction
        newCtx.drawImage(originalImage, 0, 0);

        //smear effect
        var numSmears = 4;

        for(var smearCounter=0; smearCounter<numSmears; smearCounter++){
            
            var smearOrder = Math.random() //choose to start with top, right, bottom, or left

            if(smearOrder <= 0.25){
                topSmear();
                rightSmear();
                bottomSmear();
                leftSmear();
            } else if(smearOrder <= 0.5){
                rightSmear();
                bottomSmear();
                leftSmear(); 
                topSmear();                   
            } else if(smearOrder <= 0.5){
                bottomSmear();
                leftSmear(); 
                topSmear();   
                rightSmear();                
            } else {
                leftSmear(); 
                topSmear();    
                rightSmear();
                bottomSmear();               
            }

        }

    } else if(visualizationChoice == "noise"){
        console.log("running noise visual");

        for (let j = 0; j < pixels.length; j += 4) {
            var actualRed = pixels[j];
            var actualGreen = pixels[j + 1];
            var actualBlue = pixels[j + 2] ;
            var actualAlpha = pixels[j + 3];

            var randomRed = chosenColorR - rgbColorRange/2 + (Math.random() * rgbColorRange);
            var randomGreen = chosenColorG - rgbColorRange/2 + (Math.random() * rgbColorRange);
            var randomBlue = chosenColorB - rgbColorRange/2 + (Math.random() * rgbColorRange);
            var randomAlpha = 1;

            if(Math.random() <= noiseProbability/100){
                newCtx.fillStyle = `rgba(${randomRed}, ${randomGreen}, ${randomBlue}, ${randomAlpha})`;
            } else {
                newCtx.fillStyle = `rgba(${actualRed}, ${actualGreen}, ${actualBlue}, ${actualAlpha})`;
            }

            newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
        }

    } else if(visualizationChoice == "perlin"){
        console.log("running perlin visual");

        generatePerlinNoise();

        for (let j = 0; j < pixels.length; j += 4) {

            var pixelX = j / 4 % actualWidth;
            var pixelY = Math.floor(j / 4 / actualWidth);

            var perlinXGridSize = actualWidth / dataWidth;
            var perlinYGridSize = actualHeight / dataHeight;

            var perlinX = Math.floor(pixelX / perlinXGridSize);
            var perlinY = Math.floor(pixelY / perlinYGridSize);

            var perlinDataValue = perlinDataArray[perlinY][perlinX];

            var red = pixels[j];
            var green = pixels[j + 1];
            var blue = pixels[j + 2];
            var alpha = pixels[j + 3];

            newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);

            //var newRed = chosenColorR * perlinDataValue/(noiseProbability/100);
            var newRed = chosenColorR - (255 * (perlinDataValue-0.2));
            var newGreen = chosenColorG  - (255 * (perlinDataValue-0.2));
            var newBlue = chosenColorB;
            var newAlpha = Math.min(0.92, (1 - (perlinDataValue/(noiseProbability/100))) * 5 - 0.4);

            if(perlinDataValue > noiseProbability/100){
                //newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            } else {
                newCtx.fillStyle = `rgba(${newRed}, ${newGreen}, ${newBlue}, ${newAlpha})`;
            }
            newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
        }

    } else if(visualizationChoice == "perlin2"){
        console.log("running perlin2 visual");
        generatePerlinNoise();

        for (let j = 0; j < pixels.length; j += 4) {

            var pixelX = j / 4 % actualWidth;
            var pixelY = Math.floor(j / 4 / actualWidth);

            var perlinXGridSize = actualWidth / dataWidth;
            var perlinYGridSize = actualHeight / dataHeight;

            var perlinX = Math.floor(pixelX / perlinXGridSize);
            var perlinY = Math.floor(pixelY / perlinYGridSize);

            var perlinDataValue = perlinDataArray[perlinY][perlinX];

            var red = pixels[j];
            var green = pixels[j + 1];
            var blue = pixels[j + 2];
            var alpha = pixels[j + 3];

            var randomRed = chosenColorR - rgbColorRange/2 + (Math.random() * rgbColorRange);
            var randomGreen = chosenColorG - rgbColorRange/2 + (Math.random() * rgbColorRange);
            var randomBlue = chosenColorB - rgbColorRange/2 + (Math.random() * rgbColorRange);
            var randomAlpha = 1;

            if((Math.pow(perlinDataValue,2.5) * Math.random()) < ((noiseProbability/100) * 0.025) || ((((100 - noiseProbability)/100) * Math.random() * Math.pow(perlinDataValue,2)) < 0.005)){
                newCtx.fillStyle = `rgba(${randomRed}, ${randomGreen}, ${randomBlue}, ${randomAlpha})`;

            } else {
                newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            }
            newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
        }

    } else if(visualizationChoice == "perlin3"){
        console.log("running perlin3 visual");

        var maxPixelSize = 15;
        
        generatePerlinNoise();

        for (let j = pixels.length-4; j >= 0; j -= 4) {

            var pixelSize = Math.max(1, Math.round(Math.random() * maxPixelSize * (noiseProbability/100)));

            var pixelX = j / 4 % actualWidth;
            var pixelY = Math.floor(j / 4 / actualWidth);

            var perlinXGridSize = actualWidth / dataWidth;
            var perlinYGridSize = actualHeight / dataHeight;

            var perlinX = Math.floor(pixelX / perlinXGridSize);
            var perlinY = Math.floor(pixelY / perlinYGridSize);

            var perlinDataValue = perlinDataArray[perlinY][perlinX];

            var red = pixels[j];
            var green = pixels[j + 1];
            var blue = pixels[j + 2];
            var alpha = pixels[j + 3];

            var randomRed = chosenColorR - rgbColorRange/2 + (Math.random() * rgbColorRange);
            var randomGreen = chosenColorG - rgbColorRange/2 + (Math.random() * rgbColorRange);
            var randomBlue = chosenColorB - rgbColorRange/2 + (Math.random() * rgbColorRange);
            var randomAlpha = 1;

            if((Math.pow(perlinDataValue,1.6) * Math.random()) < ((noiseProbability/100) * 0.010) || ((((100 - noiseProbability)/100) * Math.random() * Math.pow(perlinDataValue,2)) < 0.0001)){
                newCtx.fillStyle = `rgba(${randomRed}, ${randomGreen}, ${randomBlue}, ${randomAlpha})`;

            } else {
                //pixelSize = 1;
                newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            }
            newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), pixelSize, pixelSize);
        }

    } else if(visualizationChoice == "pixelPop"){
        console.log("running pixelPop visual");

        var numChangePixels = 300;
        var maxWidth = 500;
        var maxHeight = 500;
        var backgroundAlphaValue = 0.8;
        var foregroundAlphaValue = 0.5;


        for(i=0; i<numChangePixels; i++){
            var currentPixelX = Math.round(Math.random() * actualWidth);
            var currentPixelY = Math.round(Math.random() * actualHeight);
            var pixelDataValue = (currentPixelY*actualWidth + currentPixelX) * 4;

            var actualRed = pixels[pixelDataValue];
            var actualGreen = pixels[pixelDataValue + 1];
            var actualBlue = pixels[pixelDataValue + 2];

            var pixelSize = Math.random() * maxWidth;
            newCtx.fillStyle = `rgba(${actualRed}, ${actualGreen}, ${actualBlue}, ${backgroundAlphaValue})`;
            newCtx.fillRect(currentPixelX, currentPixelY, pixelSize, pixelSize);

        }

        for (let j = 0; j < pixels.length; j += 4) {
            
            //Re-produce full picture
            var actualRed = pixels[j];
            var actualGreen = pixels[j + 1];
            var actualBlue = pixels[j + 2];

            newCtx.fillStyle = `rgba(${actualRed}, ${actualGreen}, ${actualBlue}, ${foregroundAlphaValue})`;
            newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
        }

    } else if(visualizationChoice == "pointillist"){
        console.log("running pointillist visual");

        var minPointRadius = 1;
        var maxPointRadius = Math.round(actualWidth/120) * (dotSizeFactor/100 + 0.5);
        var pointRadiusRange = maxPointRadius - minPointRadius;
        
        var minPixelStep = 1;
        var maxPixelStep = 5;
        var pixelStepRange = maxPixelStep - minPixelStep;

        var numPoints = 300000;

        for (let j = 0; j < numPoints; j++) {
            
            var currentPixel = Math.round( (Math.random() * (pixels.length/4)) );
            //var currentPixel = j;

            var red = pixels[currentPixel*4] - rgbColorRange/2 + (Math.random() * rgbColorRange);
            var green = pixels[currentPixel*4 + 1] - rgbColorRange/2 + (Math.random() * rgbColorRange);
            var blue = pixels[currentPixel*4 + 2];
            var alpha = 1.0;

            var startAngle = Math.random() * (2 * Math.PI);
            var endAngle = Math.random() * (2 * Math.PI);
            var currentPointRadius = minPointRadius + Math.random() * pointRadiusRange;

            newCtx.beginPath();
            newCtx.arc(currentPixel % actualWidth, Math.floor(currentPixel / actualWidth), currentPointRadius, startAngle, endAngle);
            newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            newCtx.fill();
        }

    } else if(visualizationChoice == "sketch"){
        console.log("running sketch visual");

        for (let j = pixels.length-4; j > 0; j -= 4) {
            
            var currentRed = pixels[j];
            var currentGreen = pixels[j + 1];
            var currentBlue = pixels[j + 2];
            var currentLum = Math.pow((0.299 * currentRed + 0.587 * currentGreen + 0.114 * currentBlue), 1/2.2);

            var previousRed = pixels[j-4];
            var previousGreen = pixels[j-4+1];
            var previousBlue = pixels[j-4+2];
            var previousLum = Math.pow((0.299 * currentRed + 0.587 * currentGreen + 0.114 * currentBlue), 1/2.2);

            var redDelta = Math.abs(currentRed - previousRed);
            var greenDelta = Math.abs(currentGreen - previousGreen);
            var blueDelta = Math.abs(currentBlue - previousBlue);
            var lumDelta = Math.abs(currentLum - previousLum);

            var alpha = Math.pow(Math.min(1,Math.max(0,(redDelta + greenDelta + blueDelta)/100)), 4);

            var primaryThreshold = 14 * (Math.pow((noiseProbability/100 + 0.5),5));

            var pixelWidth = Math.round(Math.random()*actualWidth*0.01);
            var pixelHeight = Math.round(Math.random()*7);

            if(redDelta > primaryThreshold || greenDelta > primaryThreshold || blueDelta > primaryThreshold || lumDelta > 1){
                newCtx.fillStyle = `rgba(${currentRed}, ${currentGreen}, ${currentBlue}, ${alpha})`; //colour sketch
                newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), pixelWidth, pixelHeight);

            } else {
                if(Math.random() < 0.04){
                    var alpha = 0.2;
                    newCtx.fillStyle = `rgba(${currentRed}, ${currentGreen}, ${currentBlue}, ${alpha})`; //colour sketch
                    newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), pixelWidth*0.75, pixelHeight*0.75);
                }
            }

        }

    } else if(visualizationChoice == "palletize"){
        console.log("running palletize visual");
        console.log("Color Palette: "+paletteChoice);

        //faithful reproduction
        newCtx.drawImage(originalImage, 0, 0);

        for (let j = 0; j < pixels.length; j += 4) {
            
            var red = pixels[j];
            var green = pixels[j + 1];
            var blue = pixels[j + 2];

            var lowestDistance = 0;
            var targetR;
            var targetG;
            var targetB;
            var alpha = Math.min(1,Math.max(0,noiseProbability/100));

            for(i=0; i<chosenPaletteRGBValues.length; i++){

                var currentDistance = Math.sqrt(
                    (red - chosenPaletteRGBValues[i][0]) ** 2 +
                    (green - chosenPaletteRGBValues[i][1]) ** 2 +
                    (blue - chosenPaletteRGBValues[i][2]) ** 2
                );

                if(i==0 || currentDistance < lowestDistance){
                    lowestDistance = currentDistance;
                    targetR = chosenPaletteRGBValues[i][0];
                    targetG = chosenPaletteRGBValues[i][1];
                    targetB = chosenPaletteRGBValues[i][2];
                }
            }

            newCtx.fillStyle = `rgba(${targetR}, ${targetG}, ${targetB}, ${alpha})`; //colour sketch
            newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
        }

    } else if(visualizationChoice == "pixel"){
        console.log("running pixel visual");

        var newPixelSize = Math.floor(Math.max(1,noiseProbability)); //width and height of new pixel square
        var numRows = actualHeight / newPixelSize;
        var numCols = actualWidth / newPixelSize;

        var alpha = 1;

        for(var cellY=0; cellY < Math.ceil(numRows); cellY++ ){
            for(var cellX=0; cellX < Math.ceil(numCols); cellX++ ){

                var cellPixels = [];

                for(var pixelY=0; pixelY<newPixelSize; pixelY++){
                    
                    for(var pixelX=0; pixelX<newPixelSize; pixelX++){

                        var currentXPosition = cellX*newPixelSize + pixelX;
                        var currentYPosition = cellY*newPixelSize + pixelY;

                        var currentPixelDataValue = (currentYPosition * actualWidth + currentXPosition) * 4;

                        if(currentXPosition < actualWidth && currentYPosition < actualHeight){
                            cellPixels.push(pixels[currentPixelDataValue]);
                            cellPixels.push(pixels[currentPixelDataValue + 1]);
                            cellPixels.push(pixels[currentPixelDataValue + 2]);
                            cellPixels.push(pixels[currentPixelDataValue + 3]);
                        }

                    }
                }

                var avgColor = getAverageColor(cellPixels);
                newCtx.fillStyle = `rgba(${avgColor[0]}, ${avgColor[1]}, ${avgColor[2]}, ${alpha})`;
                newCtx.fillRect(cellX*newPixelSize, cellY*newPixelSize, newPixelSize, newPixelSize);

            }

        }

    } else if(visualizationChoice == "clippings"){
        console.log("running clippings visual");

        var minClips = 4;
        var maxClips = 25;
        var clipsRange = maxClips - minClips;
        var numClips = Math.ceil(minClips + (noiseProbability/100)*clipsRange);
        var alpha = 1;

        for(var windowCounter=0; windowCounter < numClips; windowCounter++){
            var startX = Math.floor(Math.random() * actualWidth);
            var startY = Math.floor(Math.random() * actualHeight);
            var windowWidth = Math.floor(Math.random() * actualWidth*0.5);
            var windowHeight = Math.floor(Math.random() * actualHeight*0.5);
            var numPixels = windowWidth * windowHeight;

            for(var row=0; row<windowHeight; row++){
                for(var col=0; col<windowWidth; col++){
                    var currentXPosition = startX + col;
                    var currentYPosition = startY + row;
                    var currentPixelDataValue = (currentYPosition*actualWidth + currentXPosition) * 4;

                    var red = pixels[currentPixelDataValue];
                    var green = pixels[currentPixelDataValue+1];
                    var blue = pixels[currentPixelDataValue+2];
                    
                    newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                    newCtx.fillRect(currentXPosition, currentYPosition, 1, 1);
                }

            }

        }

    } else if(visualizationChoice == "grid"){
        console.log("run grid visual");
        if(gridLoadCounter == 0){
            // show the popup
            popup.style.display = 'block';
        }
        gridLoadCounter++;

        //faithful reproduction
        newCtx.drawImage(originalImage, 0, 0);

        var numHorizontalLines = 6 * ((noiseProbability/100)+0.5);
        var startingHeight = clickYPosition;
        var endingHeight = actualHeight;
        var heightRange = endingHeight - startingHeight;
        var strokeWidth = actualWidth / 100 / 2;
        var strokeColor = "#D336BE";
        var strokeColor2 = "#05C3DD";
        var alpha = 0.8;

        var numAngleLines = 8 * ((noiseProbability/100)+0.5);
        var xSpacing = actualWidth / (numAngleLines+1)

        for(var i=0; i<numAngleLines; i++){

            var startingXPosition = (i+1) * xSpacing;
            //var distanceFromCenter = (startingXPosition - actualWidth/2) / (actualWidth/2);
            var slope = (startingXPosition - clickXPosition) / clickXPosition;
            var lineYShift = heightRange;
            var lineXShift = lineYShift * slope;

            //draw vertical lines
            newCtx.beginPath();
            newCtx.moveTo(startingXPosition, startingHeight); // starting point
            newCtx.lineTo(startingXPosition, 0); // ending point
            newCtx.strokeStyle = strokeColor2;
            newCtx.lineWidth = strokeWidth;
            newCtx.globalAlpha = alpha/2;
            newCtx.stroke();

            //draw angle lines
            newCtx.beginPath();
            newCtx.moveTo(startingXPosition, startingHeight); // starting point
            newCtx.lineTo(startingXPosition+lineXShift, endingHeight); // ending point
            newCtx.strokeStyle = strokeColor;
            newCtx.lineWidth = strokeWidth;
            newCtx.globalAlpha = alpha;
            newCtx.stroke();

        }

        //draw top horizontal lines
        var numTopHorizontalLines = 6 * ((noiseProbability/100)+0.5);
        var topSpacing = startingHeight / numTopHorizontalLines;

        for(var i=0; i<numTopHorizontalLines; i++){
            newCtx.beginPath();
            newCtx.moveTo(0, i*topSpacing); // starting point
            newCtx.lineTo(actualWidth, i*topSpacing); // ending point
            newCtx.strokeStyle = strokeColor2;
            newCtx.lineWidth = strokeWidth;
            newCtx.globalAlpha = alpha/2;
            newCtx.stroke();
        }

        //draw horizontal lines
        for(var i=0; i<numHorizontalLines; i++){
            
            var currentHeight = startingHeight + heightRange * Math.pow(i/(numHorizontalLines-1),1.5);
            newCtx.beginPath();
            newCtx.moveTo(0, currentHeight); // starting point
            newCtx.lineTo(actualWidth, currentHeight); // ending point
            newCtx.strokeStyle = strokeColor;
            if(i==0){
                newCtx.lineWidth = strokeWidth*2;
            } else{
                newCtx.lineWidth = strokeWidth;
            }
            newCtx.globalAlpha = alpha;
            newCtx.stroke();
        }            

    } else if(visualizationChoice == "mondrian"){
        //draw Mondrian grid
        newCtx.beginPath();
        newCtx.lineWidth = 0;

        var xPad = Math.floor(actualWidth * 0.1);
        var yPad = Math.floor(actualHeight * 0.1);

        var initialRect = new Rectangle(new Point(0, 0), new Point(actualWidth, actualHeight));
        initialRect.split(xPad, yPad, 0, 4, newCtx);

        newCtx.stroke();

        //faithful reproduction
        newCtx.globalAlpha = Math.min(1,Math.max(0,1-(noiseProbability/100)));
        newCtx.drawImage(originalImage, 0, 0);

    } else if(visualizationChoice == "rings"){
        console.log("running rings visual");

        console.log("run grid visual");
        if(ringsLoadCounter == 0){
            // show the popup
            popup.style.display = 'block';

            noiseProbabilityInput.value = 23;
            noiseProbability = 23;
        }
        ringsLoadCounter++;

        var minPointRadius = 1;
        var maxPointRadius = Math.round( (actualWidth/250) * (dotSizeFactor/100 + 0.5) );
        //var maxPointRadius = 1;
        var pointRadiusRange = maxPointRadius - minPointRadius;

        if(clickXPosition === undefined) {
            clickXPosition = actualWidth/2;
        }
        if(clickYPosition === undefined) {
            clickYPosition = actualHeight/2;
        }

        var numRings = Math.ceil(noiseProbability) * 2;

        for(var i=0; i<numRings; i++){
            
            var radius = Math.floor(Math.max(actualWidth,actualHeight)/2 * 1.1 * ((i+1)/numRings));
            var centerX = clickXPosition;
            var centerY = clickYPosition;
    
            for (let angle = 0; angle < 360; angle++) {
                var x = Math.round(centerX + Math.cos(angle * Math.PI / 180) * radius);
                var y = Math.round(centerY + Math.sin(angle * Math.PI / 180) * radius);
    
                var currentPixel = y*actualWidth + x;
                //var currentPixel = j;
    
                var red = pixels[currentPixel*4];
                var green = pixels[currentPixel*4 + 1];
                var blue = pixels[currentPixel*4 + 2];
                var alpha = 1.0;
    
                var startAngle = 0;
                //var endAngle = Math.random() * (2 * Math.PI);
                var endAngle = (2 * Math.PI);
                var currentPointRadius = minPointRadius + Math.random() * pointRadiusRange;
    
                newCtx.beginPath();
                newCtx.arc(x, y, currentPointRadius, startAngle, endAngle);
                newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                newCtx.fill();
            }

        }

    } else if(visualizationChoice == "gumball"){
        console.log("running gumball visual");

        var step=Math.max(4,Math.ceil(noiseProbability/0.5));
        var xRemainder = (actualWidth - step/2) % step;
        var yRemainder = (actualHeight - step/2) % step;
        console.log("Step: "+step);

        for(y=0; y<actualHeight; y+=step){
            for(x=0; x<actualWidth; x+=step){
                var currentPixelDataValue = Math.floor(y*actualWidth+x)*4;

                var red = pixels[currentPixelDataValue];
                var green = pixels[currentPixelDataValue+1];
                var blue = pixels[currentPixelDataValue+2];
                var alpha = 1;
    
                var startAngle = 0;
                var endAngle = (2 * Math.PI);
                var currentPointRadius = step/2;
    
                newCtx.beginPath();
                newCtx.arc(x+xRemainder/2, y+yRemainder/2, currentPointRadius, startAngle, endAngle);
                newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                newCtx.fill();

            }
        }
    
    } else if(visualizationChoice == "noisySort"){
        console.log("running noisy sort visual");

        var numPixels = actualWidth * actualHeight;
        var originalPixelData = [];

        for(var i=0; i<numPixels; i++){

            var noise = Math.random() * (noiseProbability*4);

            var red = pixels[i*4];
            var green = pixels[i*4+1];
            var blue = pixels[i*4+2];
            //var score = Math.sqrt( .241 * red + .691 * green + .068 * blue + noise);
            var score = Math.pow((0.299 * red + 0.587 * green + 0.114 * blue + noise), 1/2.2)
            //var score = red+green+blue;

            originalPixelData[i] = {red: red, green: green, blue: blue, score: score, id: i};

        }

        var sortedPixelData = originalPixelData.slice().sort((a, b) => a.score - b.score);

        for (let i = 0; i < sortedPixelData.length; i++) {
            var red = sortedPixelData[i].red;
            var green = sortedPixelData[i].green;
            var blue = sortedPixelData[i].blue;
            var alpha = 1;
            newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            newCtx.fillRect(i % actualWidth, Math.floor(i / actualWidth), 1, 1);
        }

    } else if(visualizationChoice == "void"){
        console.log("running void visual");

        var numPixels = actualWidth * actualHeight;

        for(var i=numPixels-1; i>=0; i--){

            var red = pixels[i*4];
            var green = pixels[i*4+1];
            var blue = pixels[i*4+2];
            var lum = Math.pow((0.299 * red + 0.587 * green + 0.114 * blue), 1/2.2)
            var threshold = noiseProbability / 9;
            var alpha = 1;
            var pixelWidth = 1;
            var pixelHeight = 1;

            if(lum > threshold){
                newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                pixelWidth = 1;
                pixelHeight = 1;
            } else {
                if(Math.random()<0.7){
                    newCtx.fillStyle = `black`;
                } else {
                    var randomRed = Math.random() * 255;
                    var randomGreen = Math.random() * 255;
                    var randomBlue = Math.random() * 255;
                    newCtx.fillStyle = `rgba(${randomRed}, ${randomGreen}, ${randomBlue}, ${alpha})`;
                }
                pixelWidth = Math.ceil(Math.random()* actualWidth*0.006);
                pixelHeight = Math.ceil(Math.random()* actualHeight*0.006);

            }
            newCtx.fillRect(i % actualWidth, Math.floor(i / actualWidth), pixelWidth, pixelHeight);

        }

    } else if(visualizationChoice == "braille"){
        console.log("running braille visual");

        var numPixels = actualWidth * actualHeight;
        var colSpacing = Math.floor(actualWidth/50 * Math.pow((noiseProbability/100 + 0.5),2) );
        var rowSpacing = colSpacing;

        var alpha = 1;
        var pixelWidth = 1;
        var pixelHeight = 1;
        var skipRow = true;
        var skipCol = true;

        for(var row=0; row<actualHeight; row++){
            skipRow = true;
            if(row%rowSpacing == 0){
                skipRow = false;
            }

            for(var col=0; col<actualWidth; col++){
                var currentPixel = row*actualWidth + col;
                var red = pixels[currentPixel*4];
                var green = pixels[currentPixel*4+1];
                var blue = pixels[currentPixel*4+2];
                var lum = Math.pow((0.299 * red + 0.587 * green + 0.114 * blue), 1/2.2)
                
                var minRadius = 3;
                var maxRadius = colSpacing/2;

                var dotRadius = Math.max(minRadius,Math.min(maxRadius,Math.pow(lum/2,1.8)));

                skipCol = true;
                if(col%colSpacing == 0){
                    skipCol = false;
                }

                if(skipRow == true || skipCol == true){
                    //newCtx.fillStyle = "white";
                    //newCtx.fillRect(col, row, 1, 1);
                } else {
                    newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                    newCtx.beginPath();
                    newCtx.arc(col, row, dotRadius, 0, 2*Math.PI);
                    newCtx.fill();
                }

            }

        }

    }  else if(visualizationChoice == "dust"){
        console.log("running dust visual");
        var skipStep = 1;

        for (let j = pixels.length-4; j > 0; j -= 4*skipStep) {
            
            var currentRed = pixels[j];
            var currentGreen = pixels[j + 1];
            var currentBlue = pixels[j + 2];
            var currentLum = Math.pow((0.299 * currentRed + 0.587 * currentGreen + 0.114 * currentBlue), 1/2.2);

            var previousRed = pixels[j-4];
            var previousGreen = pixels[j-4+1];
            var previousBlue = pixels[j-4+2];
            var previousLum = Math.pow((0.299 * previousRed + 0.587 * previousGreen + 0.114 * previousBlue), 1/2.2);

            var redDelta = Math.abs(currentRed - previousRed);
            var greenDelta = Math.abs(currentGreen - previousGreen);
            var blueDelta = Math.abs(currentBlue - previousBlue);
            var lumDelta = Math.abs(currentLum - previousLum);

            var alpha = Math.pow(Math.min(1,Math.max(0,(redDelta + greenDelta + blueDelta)/100)), 4);

            var primaryThreshold = 7 * (Math.pow((noiseProbability/100 + 0.5),1.1));

            var pixelWidth = Math.random()*3;
            var pixelHeight = Math.random()*3;

            var pixelColor = chosenPalette[ Math.floor(Math.random() * chosenPalette.length) ];

            if(currentLum < primaryThreshold){
                newCtx.fillStyle = pixelColor;
                newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), pixelWidth, pixelHeight);
            }
        }
    } else if(visualizationChoice == "outlines"){
        console.log("running outlines visual");
        var skipStep = 1;

        for (let j = pixels.length-4; j > 0; j -= 4*skipStep) {
            
            var currentRed = pixels[j];
            var currentGreen = pixels[j + 1];
            var currentBlue = pixels[j + 2];
            //var currentLum = Math.pow((0.299 * currentRed + 0.587 * currentGreen + 0.114 * currentBlue), 1/2.2);
            var currentLight = rgbToLightness(currentRed,currentGreen,currentBlue);

            var previousRed = pixels[j-4];
            var previousGreen = pixels[j-4+1];
            var previousBlue = pixels[j-4+2];
            //var previousLum = Math.pow((0.299 * previousRed + 0.587 * previousGreen + 0.114 * previousBlue), 1/2.2);
            var previousLight = rgbToLightness(previousRed,previousGreen,previousBlue);


            var nextRed = pixels[j+4];
            var nextGreen = pixels[j+4 + 1];
            var nextBlue = pixels[j+4 + 2];
            //var nextLum = Math.pow((0.299 * nextRed + 0.587 * nextGreen + 0.114 * nextBlue), 1/2.2);
            var nextLight = rgbToLightness(nextRed,nextGreen,nextBlue);

            var lightDelta = Math.abs(currentLight - previousLight) + Math.abs(currentLight - nextLight);
            newCtx.globalAlpha = Math.max(0.2,lightDelta*3);

            //var primaryThreshold = 7 * (Math.pow((noiseProbability/100 + 0.5),1.1));
            //var secondaryThreshold = 7 * (Math.pow(((100-noiseProbability)/100 + 0.5),1.1));

            var primaryThreshold = (3+0.94*noiseProbability)/100;
            var secondaryThreshold = (100 - (3+0.94*noiseProbability)) / 100;

            var pixelWidth = Math.random()*actualWidth*0.004;
            var pixelHeight = Math.random()*actualHeight*0.004;

            if( (currentLight < primaryThreshold && previousLight > primaryThreshold && nextLight < primaryThreshold) || (currentLight < primaryThreshold && previousLight < primaryThreshold && nextLight > primaryThreshold) ){
                newCtx.fillStyle = dualColor1;
                newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), pixelWidth, pixelHeight);
            } else if( (currentLight < secondaryThreshold && previousLight > secondaryThreshold && nextLight < secondaryThreshold) || (currentLight < secondaryThreshold && previousLight < secondaryThreshold && nextLight > secondaryThreshold) ){
                newCtx.fillStyle = dualColor2;
                newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), pixelWidth, pixelHeight);
            }

        }
    } else if(visualizationChoice == "frontier"){
        console.log("running frontier visual");

        if(frontierLoadCounter == 0){
            // show the popup
            popup.style.display = 'block';

            clickXPosition = actualWidth/2;
            clickYPosition = actualHeight/2;
        }
        frontierLoadCounter++;

        var heightWidthRatio = actualHeight / actualWidth;
        var alpha = 1;
        var pixelWidth = 1;
        var pixelHeight = 1;

        for(var y=0; y<actualHeight; y++){

            for(var x=0; x<actualWidth; x++){

                var currentPixel = (y*actualWidth + x)*4;

                var currentRed = pixels[currentPixel];
                var currentGreen = pixels[currentPixel + 1];
                var currentBlue = pixels[currentPixel + 2];
                var currentLum = Math.pow((0.299 * currentRed + 0.587 * currentGreen + 0.114 * currentBlue), 1/2.2);
    
                var pixelDistance = Math.abs(y - clickYPosition)/actualHeight * heightWidthRatio + Math.abs(x - clickXPosition)/actualWidth;
                var primaryThreshold = 10 - (pixelDistance*(noiseProbability/3));

                if(currentLum < primaryThreshold){
                    newCtx.fillStyle = `rgba(${currentRed}, ${currentGreen}, ${currentBlue}, ${alpha})`;
                    newCtx.fillRect(x, y, pixelWidth, pixelHeight);
                }

            }

        }

    } else if(visualizationChoice == "eclipse"){
        console.log("running eclipse visual");

        var alpha = 1;
        var threshold = 0.3 + (0.6 * (noiseProbability/100));

        for(var y=0; y < actualHeight; y++ ){
            for(var x=0; x < actualWidth; x++ ){

                var actualPixel = (y * actualWidth + x) * 4;
                var actualRed = pixels[actualPixel];
                var actualGreen = pixels[actualPixel + 1];
                var actualBlue = pixels[actualPixel + 2];
                var actualLightness = rgbToLightness(actualRed, actualGreen, actualBlue);

                if(actualLightness > threshold ){
                    newCtx.fillStyle = `rgba(${actualRed}, ${actualGreen}, ${actualBlue}, ${alpha})`;
                    newCtx.fillRect(x, y, 1, 1);
                }
            }
        }
    } else if(visualizationChoice == "satLight"){
        console.log("running satLight visual");

        var alpha = 1;
        var lightnessThreshold = (3+0.7*lightnessLevel)/100;
        var saturationThreshold = (100 - (3+0.8*saturationLevel))/100;
        console.log(lightnessLevel + ", "+saturationLevel);


        for(var y=0; y < actualHeight; y++ ){
            for(var x=0; x < actualWidth; x++ ){

                var actualPixel = (y * actualWidth + x) * 4;
                var actualRed = pixels[actualPixel];
                var actualGreen = pixels[actualPixel + 1];
                var actualBlue = pixels[actualPixel + 2];
                var actualSaturation = rgbToSaturation(actualRed, actualGreen, actualBlue);
                var actualLightness = rgbToLightness(actualRed, actualGreen, actualBlue);
                var actualAlpha = 1;

                if(actualLightness < lightnessThreshold || actualSaturation > saturationThreshold){
                    newCtx.fillStyle = `rgba(${actualRed}, ${actualGreen}, ${actualBlue}, ${actualAlpha})`;
                    newCtx.fillRect(x, y, 1, 1);

                }
            }
        }
    } else if(visualizationChoice == "edgy"){
        console.log("running edgy visual");

        var lightDataArray = [];

        //generate data array for all pixel lightness values
        for(var y=0; y < actualHeight; y++ ){

            lightDataArray[y] = [];

            for(var x=0; x < actualWidth; x++ ){

                var actualPixel = (y * actualWidth + x) * 4;
                var actualRed = pixels[actualPixel];
                var actualGreen = pixels[actualPixel + 1];
                var actualBlue = pixels[actualPixel + 2];
                //var actualLightness = rgbToLightness(actualRed, actualGreen, actualBlue);
                var actualLum = (0.2989 * actualRed + 0.5870 * actualGreen + 0.1140 * actualBlue)/255;

                lightDataArray[y][x] = actualLum;

            }
        }

        console.log("lightness data array filled");

        //gaussian smoothing function
        var smoothedLightDataArray = []
        var kernelWidth = 5;
        var kernelHeight = kernelWidth;
        var middlePixel = Math.floor(kernelWidth/2);
        var kernelWeights = [0.003663004, 0.014652015, 0.025641026, 0.014652015, 0.003663004, 0.014652015, 0.058608059, 0.095238095, 0.058608059, 0.014652015, 0.025641026, 0.095238095, 0.15018315, 0.095238095, 0.025641026, 0.014652015, 0.058608059, 0.095238095, 0.058608059, 0.014652015, 0.003663004, 0.014652015, 0.025641026, 0.014652015, 0.003663004];

        for(var y=0; y < actualHeight; y++ ){
            smoothedLightDataArray[y] = [];

            for(var x=0; x < actualWidth; x++ ){
                
                var kernelData = [];

                for(var kernelY=0; kernelY<kernelHeight; kernelY++){
                    for(var kernelX=0; kernelX<kernelWidth; kernelX++){
                        var pixelXPosition = x + (kernelX-middlePixel);
                        var pixelYPosition = y + (kernelY-middlePixel);
                        if(pixelXPosition >= 0 && pixelXPosition < actualWidth && pixelYPosition >= 0 && pixelYPosition < actualHeight){
                            kernelData.push(lightDataArray[pixelYPosition][pixelXPosition]);
                        }else{
                            kernelData.push(0);
                        }
                    }
                }

                var weightedAverageLight = calcWeightedAverage(kernelData,kernelWeights);
                smoothedLightDataArray[y][x] = weightedAverageLight;

            }
        }

        //draw vertical edges
        var alpha = 1;
        //var threshold = 0.02 + ((0.8*noiseProbability)/100);
        var threshold = 0.165 - (noiseProbability/100 * 0.15);
        var pixelWidth = 2;
        var pixelHeight = 2;

        for(var y=0; y < actualHeight; y++ ){
            for(var x=0; x < actualWidth; x++ ){

                if(x==0 || y==0 || x==actualWidth-1 || y==actualHeight-1){
                    continue;
                }
                var lightValue = smoothedLightDataArray[y][x];
                var leftLight = smoothedLightDataArray[y][x-1];
                var rightLight = smoothedLightDataArray[y][x+1];

                var delta1 = Math.abs(lightValue - leftLight);
                var delta2 = Math.abs(lightValue - rightLight);

                var red = lightValue * 255;
                var green = lightValue * 255;
                var blue = lightValue * 255;

                //if(lightValue < threshold && (leftLight > threshold || rightLight > threshold)){
                if(delta1 > threshold){
                    //newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                    newCtx.fillStyle = dualColor1;
                    newCtx.globalAlpha = 0.5;
                    newCtx.fillRect(x, y, pixelWidth, pixelHeight);
                }

            }
        }

        //draw horizontal edges
        for(var y=0; y < actualHeight; y++ ){
            for(var x=0; x < actualWidth; x++ ){

                if(x==0 || y==0 || x==actualWidth-1 || y==actualHeight-1){
                    continue;
                }
                var lightValue = smoothedLightDataArray[y][x];
                var topLight = smoothedLightDataArray[y-1][x];
                var bottomLight = smoothedLightDataArray[y+1][x];

                var delta1 = Math.abs(lightValue - topLight);
                var delta2 = Math.abs(lightValue - bottomLight);

                var red = lightValue * 255;
                var green = lightValue * 255;
                var blue = lightValue * 255;

                //if(lightValue < threshold && (topLight > threshold || bottomLight > threshold)){
                if(delta1 > threshold){
                    //newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                    newCtx.fillStyle = dualColor2;
                    newCtx.globalAlpha = 0.5;
                    newCtx.fillRect(x, y, pixelWidth, pixelHeight);
                }

            }
        }

    } else if(visualizationChoice == "shadow"){

        //faithful reproduction
        newCtx.drawImage(originalImage, 0, 0);

        var numLayers = 4;
        var alpha = 0.3;
        var maxXOffset = 0.03 * actualWidth;
        var maxYOffset = 0.03 * actualHeight

        for(var layerCounter=0; layerCounter<numLayers; layerCounter++){
            
            var xOffset = Math.ceil(randomBM()*maxXOffset - (maxXOffset/2));
            var yOffset = Math.ceil(randomBM()*maxYOffset - (maxYOffset/2));

            for(var y=0; y < actualHeight; y++ ){
    
                for(var x=0; x < actualWidth; x++ ){
    
                    var newX = x+xOffset;
                    var newY = y+yOffset;
                    if(newX<0 || newX >= actualWidth || newY<0 || newY>= actualHeight){
                        continue;
                    }

                    var actualPixel = (y * actualWidth + x) * 4;
                    var actualRed = pixels[actualPixel];
                    var actualGreen = pixels[actualPixel + 1];
                    var actualBlue = pixels[actualPixel + 2];
                    var actualLum = (0.2989 * actualRed + 0.5870 * actualGreen + 0.1140 * actualBlue)/255;
    
                    /*
                    if(actualLum < 0.3){
                        continue;
                    }
                    */

                    newCtx.fillStyle = `rgba(${actualRed}, ${actualGreen}, ${actualBlue}, ${alpha})`;
                    newCtx.fillRect(x+xOffset, y+yOffset, 1, 1);
    
                }
            }

        }


        
    }

    const newImageData = newCanvas.toDataURL();
    const newImage = new Image();
    newImage.src = newImageData;
    newImage.style.width = `${scaledWidth}px`;
    newImageContainer.appendChild(newImage);

    resizeTable();

    //hide the loading screen
    loadingScreen.classList.remove("lockOn");
    loadingScreen.classList.add("hidden");

    previousVisualizationChoice = visualizationChoice;

}

//Helper Functions

//shortcut key presses
document.addEventListener('keydown', function(event) {
    if (event.key === 'r') {
        refresh();

    } else if (event.key === 's') {
        saveImage();
    } else if (event.key === 'e') {
        saveBothImages();
    }
});

function saveImage(){
    const image = newImageContainer.querySelector('img');
    const imageUrl = image.src;
    const link = document.createElement('a');
    const date = new Date();
    const filename = `image_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.png`;
    
    // Create a blob from the image
    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        });

}

function saveBothImages(){

    // Get the two images
    const originalImage = imageContainer.querySelector('img');
    const newImage = newImageContainer.querySelector('img');

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set the canvas dimensions to match the combined width of the two images
    canvas.width = actualWidth*2;
    canvas.height = actualHeight;
    console.log("Save both images -- canvas width / height: "+canvas.width+", "+canvas.height);

    // Draw the original image on the left side of the canvas
    ctx.drawImage(originalImage, 0, 0, actualWidth, actualHeight);

    // Draw the new image on the right side of the canvas
    ctx.drawImage(newImage, actualWidth, 0, actualWidth, actualHeight);

    // Use the canvas.toDataURL() method to generate a data URL for the combined image
    const combinedImageURL = canvas.toDataURL();

    const link = document.createElement('a');
    const date = new Date();
    const filename = `image_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.png`;
    
    // Create a blob from the image
    fetch(combinedImageURL)
        .then(response => response.blob())
        .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        });

}

function rgbToHue(r, g, b) {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const hue = Math.atan2(Math.sqrt(3) * (gNorm - bNorm), 2 * rNorm - gNorm - bNorm);
    return hue * 180 / Math.PI;
}

function rgbToSaturation(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return (max - min) / max;
}

function rgbToLightness(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return (max + min) / 2 / 255;
}

//returns random number between 0-1 based on normal distribution
function randomBM() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm() // resample between 0 and 1
    return num
}

function extractRGB(rgbString) {
    const rgbRegex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
    const match = rgbString.match(rgbRegex);
    if (match) {
        return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        };
    } else {
        return null;
    }
}

function calcWeightedAverage(data,weights){
    var weightedAverage = 0;
    for(var i=0; i<data.length; i++){
        weightedAverage += data[i]*weights[i];
    }
    return weightedAverage;
}

function getAverageColor(chosenPixels) {
    var r = 0;
    var g = 0;
    var b = 0;
    var count = chosenPixels.length / 4;
    for (let i = 0; i < count; i++) {
        r += chosenPixels[i * 4];
        g += chosenPixels[i * 4 + 1];
        b += chosenPixels[i * 4 + 2];
    }
    return [r / count, g / count, b / count];
}

function resizeTable(){
    const table = document.getElementById('imageTable'); 
    // set the width of each column
    table.getElementsByTagName('td')[0].style.width = `${scaledWidth}px`;
    table.getElementsByTagName('td')[1].style.width = `${scaledWidth}px`;
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

//perlin data variables
var perlinDataArray = []; //store perlin data here (0-1 range)
var GRID_SIZE = 3; //number of seed points
var RESOLUTION = 100;
var dataWidth = GRID_SIZE * RESOLUTION; //total data points will be this squared (L*W)
var dataHeight = dataWidth;
var numPerlinDataPoints = dataWidth * dataHeight;

//generate perlin noise field
function generatePerlinNoise(){

    perlin.seed();
    perlinDataArray = [];


    //Display perlin noise field on the page

    let cnvs = document.getElementById('cnvs');
    cnvs.width = cnvs.height = maxImageWidth;
    let ctx = cnvs.getContext('2d');

    const COLOR_SCALE = 250;

    let pixel_size = cnvs.width / RESOLUTION;
    let num_pixels = GRID_SIZE / RESOLUTION;

    var stepSize = num_pixels / GRID_SIZE;

    for (let y = 0; y < GRID_SIZE; y += num_pixels / GRID_SIZE){
        
        var yDataValue = Math.round(y/stepSize);
        perlinDataArray[yDataValue] = [];

        for (let x = 0; x < GRID_SIZE; x += num_pixels / GRID_SIZE){
            
            var xDataValue = Math.round(x/stepSize);
            
            let v = parseFloat(perlin.get(x, y));

            ctx.fillStyle = 'hsl('+v*COLOR_SCALE+',50%,50%)';
            ctx.fillRect(
                x / GRID_SIZE * cnvs.width,
                y / GRID_SIZE * cnvs.width,
                pixel_size,
                pixel_size
            );

            //store perlin data value in the range of 0 to 1
            perlinDataArray[yDataValue][xDataValue] = v/2 + 0.5;

        }
    }

}

function leftSmear(){
    var smearStartingX = 0;
    var smearStartingY = Math.round(Math.random()*actualHeight);
    var smearWidth = Math.round(Math.random()*actualWidth*(noiseProbability/100));
    var smearHeight = Math.round(Math.random()*actualHeight*(noiseProbability/100));
    
    var pixelSize = Math.ceil(Math.max(actualWidth,actualHeight)/500);

    for(var i=0; i<smearHeight; i+=pixelSize){

        var currentDataValue = ((smearStartingY+i)*actualWidth + smearStartingX)*4;

        var newRed = pixels[currentDataValue];
        var newGreen = pixels[currentDataValue+1];
        var newBlue = pixels[currentDataValue+2];

        for(var j=0; j<smearWidth; j+=pixelSize){

            var newAlpha = 1 - (j/smearWidth);

            newCtx.fillStyle = `rgba(${newRed}, ${newGreen}, ${newBlue}, ${newAlpha})`;
            newCtx.fillRect(smearStartingX+j, smearStartingY+i, pixelSize, pixelSize);

        }
    }
}

function rightSmear(){
    var smearStartingX = actualWidth-1;
    var smearStartingY = Math.round(Math.random()*actualHeight);
    var smearWidth = Math.round(Math.random()*actualWidth*(noiseProbability/100));
    var smearHeight = Math.round(Math.random()*actualHeight*(noiseProbability/100));
    
    var pixelSize = Math.ceil(Math.max(actualWidth,actualHeight)/500);

    for(var i=0; i<smearHeight; i+=pixelSize){

        var currentDataValue = ((smearStartingY+i)*actualWidth + smearStartingX)*4;

        var newRed = pixels[currentDataValue];
        var newGreen = pixels[currentDataValue+1];
        var newBlue = pixels[currentDataValue+2];

        for(var j=0; j<smearWidth; j+=pixelSize){

            var newAlpha = 1 - (j/smearWidth);

            newCtx.fillStyle = `rgba(${newRed}, ${newGreen}, ${newBlue}, ${newAlpha})`;
            newCtx.fillRect(smearStartingX-j, smearStartingY+i, pixelSize, pixelSize);

        }
    }
}

function topSmear(){
    var smearStartingX = Math.round(Math.random()*actualWidth);
    var smearStartingY = 0;
    var smearWidth = Math.round(Math.random()*actualWidth*(noiseProbability/100));
    var smearHeight = Math.round(Math.random()*actualHeight*(noiseProbability/100));
    
    var pixelSize = Math.ceil(Math.max(actualWidth,actualHeight)/500);

    for(var i=0; i<smearWidth; i += pixelSize){

        var currentDataValue = (smearStartingX + i)*4;

        var newRed = pixels[currentDataValue];
        var newGreen = pixels[currentDataValue+1];
        var newBlue = pixels[currentDataValue+2];

        for(var j=0; j<smearHeight; j += pixelSize){

            var newAlpha = 1 - (j/smearHeight);

            newCtx.fillStyle = `rgba(${newRed}, ${newGreen}, ${newBlue}, ${newAlpha})`;
            newCtx.fillRect(smearStartingX+i, smearStartingY+j, pixelSize, pixelSize);

        }
    }
}

function bottomSmear(){
    var smearStartingX = Math.round(Math.random()*actualWidth);
    var smearStartingY = actualHeight-1;
    var smearWidth = Math.round(Math.random()*actualWidth*(noiseProbability/100));
    var smearHeight = Math.round(Math.random()*actualHeight*(noiseProbability/100));
    
    var pixelSize = Math.ceil(Math.max(actualWidth,actualHeight)/500);

    for(var i=0; i<smearWidth; i+=pixelSize){

        var currentDataValue = ((smearStartingX+i)+(smearStartingY*actualWidth)) *4;

        var newRed = pixels[currentDataValue];
        var newGreen = pixels[currentDataValue+1];
        var newBlue = pixels[currentDataValue+2];

        for(var j=0; j<smearHeight; j+=pixelSize){

            var newAlpha = 1 - (j/smearHeight);

            newCtx.fillStyle = `rgba(${newRed}, ${newGreen}, ${newBlue}, ${newAlpha})`;
            newCtx.fillRect(smearStartingX+i, smearStartingY-j, pixelSize, pixelSize);

        }
    }
}

function initColorPickers(){

    colorPicker.addEventListener('change', (e) => {
        updateColorPickers();
    });

    colorPicker2.addEventListener('change', (e) => {
        updateColorPickers();
    });

    colorPicker3.addEventListener('change', (e) => {
        updateColorPickers();
    });

    colorPicker4.addEventListener('change', (e) => {
        updateColorPickers();
    });

    colorPicker5.addEventListener('change', (e) => {
        updateColorPickers();
    });

    colorPicker6.addEventListener('change', (e) => {
        updateColorPickers();
    });

    backgroundColorInput.addEventListener('change', (e) => {
        refresh();
    });    
}

function changePalette(){

    paletteChoice = paletteChoiceInput.value;
    
    for (let idx = 0; idx < palettePresets.length; idx++){
        if (palettePresets[idx].name == paletteChoice){
            chosenPalette = palettePresets[idx].palette;
            break;
        }
    }

    for (let idx = 0; idx < pickers.length; idx++){
        pickers[idx].value = chosenPalette[idx];
    }
    
    updateColorPickers();    
}

function updateColorPickers(){

    for (let idx = 0; idx < pickers.length; idx++){
        var currentColor = pickers[idx].value;
        chosenPalette[idx] = currentColor;
        var currentColorRGB = hexToRgb(currentColor);
        chosenPaletteRGBValues[idx] = [currentColorRGB.r, currentColorRGB.g, currentColorRGB.b];
    }

    //Modify and save changes to custom palette
    var customIndex = palettePresets.findIndex(obj => obj.name === "custom");
    console.log("Palette choice: "+paletteChoice);
    if(paletteChoice == "custom"){
        palettePresets[customIndex].palette = chosenPalette;
    }

    refresh();
}

var carouselClickCounter = 0;

function initPhotoCarousel(){

    const carousel = document.querySelector('.carousel');
    const carouselInner = carousel.querySelector('.carousel-inner');
    const carouselItems = carouselInner.querySelectorAll('.carousel-item');
    const carouselDots = carousel.querySelectorAll('.carousel-dot');

    let currentSlide = 0;

    carouselDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            carouselClickCounter++;
            currentSlide = index;
            updateCarousel();
        });
    });

    function updateCarousel() {
        
        if (currentSlide < 0) {
            currentSlide = carouselItems.length - 1;
        } else if (currentSlide >= carouselItems.length) {
            currentSlide = 0;
        }
        
        carouselItems.forEach((item, index) => {
            item.classList.remove('active');
            if (index === currentSlide) {
            item.classList.add('active');
            }
        });

        carouselDots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === currentSlide) {
            dot.classList.add('active');
            }
        });
    }
    
    //Autoplay three times only
    let iterationCount = 0;
    let autoplayIntervalId = setInterval(() => {
        if(carouselClickCounter>0){
            return;
        }
        currentSlide++;
        updateCarousel();
        iterationCount++;
        if (iterationCount >= 3) {
            clearInterval(autoplayIntervalId);
        }
    }, 4800); //milliseconds before slide change

}

// Mondrian object and functions

function randInt (min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

class Point {
    constructor (x, y) {
        this.x = x
        this.y = y
    }
}

class Rectangle {
    constructor (min, max) {
        this.min = min
        this.max = max
    }

    get width () {
        return this.max.x - this.min.x
    }

    get height () {
        return this.max.y - this.min.y
    }

    draw (ctx) {
        // Draw clockwise
        ctx.moveTo(this.min.x, this.min.y)
        ctx.lineTo(this.max.x, this.min.y)
        ctx.lineTo(this.max.x, this.max.y)
        ctx.lineTo(this.min.x, this.max.y)
        ctx.lineTo(this.min.x, this.min.y)
    }

    split (xPad, yPad, depth, limit, ctx) {
        ctx.fillStyle = chosenPalette[randInt(0, chosenPalette.length)]
        ctx.fillRect(this.min.x, this.min.y, this.max.x, this.max.y)
        this.draw(ctx)

        // Check the level of recursion
        if (depth === limit) {
        return
        }

        // Check the rectangle is enough large and tall
        if (this.width < 2 * xPad || this.height < 2 * yPad) {
        return
        }

        // If the rectangle is wider than it's height do a left/right split
        var r1 = new Rectangle()
        var r2 = new Rectangle()
        if (this.width > this.height) {
        var x = randInt(this.min.x + xPad, this.max.x - xPad)
        r1 = new Rectangle(this.min, new Point(x, this.max.y))
        r2 = new Rectangle(new Point(x, this.min.y), this.max)
        // Else do a top/bottom split
        } else {
        var y = randInt(this.min.y + yPad, this.max.y - yPad)
        r1 = new Rectangle(this.min, new Point(this.max.x, y))
        r2 = new Rectangle(new Point(this.min.x, y), this.max)
        }

        // Split the sub-rectangles
        r1.split(xPad, yPad, depth + 1, limit, ctx)
        r2.split(xPad, yPad, depth + 1, limit, ctx)
    }
}