(function($){
  let ctx;
  let canvas;
  let blankImageHTMLEntity = new Image();
  let visibleImage;

  let maxWidth;
  let maxHeight;

  let $bad;
  let $good;
  // set a default standard height
  const defaultFontHeight = 40;
  // set a standard height
  let currentFontHeight = defaultFontHeight;
  // set a default standard line padding;
  const defaultLinePadding = 5;
  // set a standard line padding
  let linePadding = defaultLinePadding;
  // I'm leaving this a let rather than a const so as to allow a drop down to choose fonts
  let font = 'Calibri';
  // the constant for scaling, can be tweaked
  const scaling = 0.99;
  // a variable to hold the horizontal alignment
  let vAlign = 'left';


  function reduceCurrentFontHeight()
  {
    currentFontHeight *= scaling;
    linePadding *= scaling;
    ctx.font = `${currentFontHeight}px ${font}`;
  }

  function renderTextLines(lines, top, left)
  {
    let lineBottom = top + currentFontHeight;
    for(let line of lines)
    {
      let justifiedLeft = left;
      if(vAlign !== 'left')
      {
        // figure out the difference between this line and the max
        // as it will be required regardless of which justification is used
        let lineWidth = ctx.measureText(line).width;
        let space = maxWidth - lineWidth;
        if(vAlign == 'center')
        {
          space /= 2;
        }
        justifiedLeft += space;
      }
      ctx.fillText(line, justifiedLeft, lineBottom);
      lineBottom += currentFontHeight + linePadding;
    }
  }

  function reduceFontForLargestWord(words)
  {
    let wc = 0;
    // first ensure that no single word is longer than the width
    while(wc <= words.length)
    {
      let word = words[wc];
      let wordWidth = ctx.measureText(word).width;
      while(wordWidth > maxWidth)
      {
        reduceCurrentFontHeight();
        wordWidth = ctx.measureText(word).width;
      }
      wc++;
    }
  }

  /**
   * Make a set of lines from words, making sure that the lines all fit width wise.
   * This may result in words going over the maximum height of the assigned area
   * @param words
   * @returns {[]}
   */
  function generateLineArrayFromWordArray(words)
  {
    let lines = [];
    let currentLine = '';
    let firstWord = true;
    for(let word of words)
    {
      // add a space to the word if it's not the first word in the line
      if(!firstWord)
      {
        word = ` ${word}`;
      }

      // get the current line width
      let currentLineWidth = ctx.measureText(currentLine).width;
      // and the current word width
      let currentWordWidth = ctx.measureText(word).width;
      // check if we can add this line without causing wrap
      if((currentWordWidth + currentLineWidth) > maxWidth)
      {
        // add the line to the array and clear it.
        lines.push(currentLine);
        currentLine = word.substr(1);
      }
      else
      {
        // add the word to the current line
        currentLine += word;
        firstWord = false;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  function addWrappedTextToCanvas(text, left, top)
  {
    if(!text.length)
    {
      return;
    }
    // default to whatever constant I use for the font height default
    currentFontHeight = defaultFontHeight;
    // do the same for padding
    linePadding = defaultLinePadding;
    // default the font so we can measure the text appropriately
    ctx.font = `${currentFontHeight}px ${font}`;

    let words = text.split(' ');

    // make sure that the largest single word can definitely fit on the screen
    reduceFontForLargestWord(words);

    // an array to hold all lines
    let lines;

    let shrinking = true;
    while(shrinking)
    {
      // assume that the font shrinking worked
      shrinking = false;

      lines = generateLineArrayFromWordArray(words);

      // check that the current array fits within the max height and if not, shrink the text
      // and start the entire process again
      let totalHeight = lines.length * (currentFontHeight + linePadding);
      shrinking = totalHeight > maxHeight;
      if(shrinking)
      {
        reduceCurrentFontHeight();
      }
    }

    renderTextLines(lines,  top, left);
  }

  function generateMeme()
  {
    // empty the canvas drawing area
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw a blank geordi meme onto the canvas
    ctx.drawImage(blankImageHTMLEntity, 0, 0);

    // get the text of the good input
    let good = $good.val();
    // get the text of the bad input
    let bad = $bad.val();

    // wrap both of those texts and render them to the canvas
    addWrappedTextToCanvas(bad, 365, 5);
    addWrappedTextToCanvas(good, 365, 365);

    visibleImage.src = canvas.toDataURL("image/png");

  }

  function makeItSo()
  {
    // create an image and make it the source of a link for convenient downloading
    let image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
    let a = this;
    a.href = image;
    a.download = 'Geordi Meme.png';
  }

  function setAlignment()
  {
    vAlign =  $(this).val();
    generateMeme();
  }

  $(function(){
    // the image we'll actually be drawing to
    visibleImage = document.getElementById('gmg_visible');

    // canvas stuff
    canvas = document.getElementById('gmg_hidden');
    canvas.width = canvas.height = 720;
    ctx = canvas.getContext('2d');
    ctx.font = `${currentFontHeight}px ${font}`;

    // 5 padding on either side
    maxWidth = canvas.width / 2 - 10;
    maxHeight = canvas.height / 2 - 10;

    // set a loader for the canvas
    blankImageHTMLEntity.onload = generateMeme;
    blankImageHTMLEntity.src = './img/blank.png';

    // bind the event handlers
    $bad = $('#meme-bad').change(generateMeme);
    $good = $('#meme-good').change(generateMeme);
    $('#save-meme').click(makeItSo);
    $('.alignment-btn').click(setAlignment);

  });
})(window.jQuery);
