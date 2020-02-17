(function($){
  let ctx;
  let canvas;
  let image = new Image();
  let $bad;
  let $good;
  // set a standard height
  let currentFontHeight = 40;
  // set a standard line padding
  let linePadding = 5;
  let font = 'Calibri';



  function reduceCurrentFontHeight()
  {
    currentFontHeight *= 0.9;
    linePadding *= 0.9;
    ctx.font = `${currentFontHeight}px ${font}`;
  }

  function wrapMemeText(text, left, top)
  {
    if(!text.length)
    {
      return;
    }
    let words = text.split(' ');


    // 5 padding on either side
    let maxWidth = canvas.width / 2 - 10;
    let maxHeight = canvas.height / 2 - 10;
    // ticker for getting an individual word
    let wc = 0;
    // ticker for the line count
    let lc = 0;

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

    // an array to hold all lines
    let lines = [];

    let shrinking = true;
    while(shrinking)
    {
      console.log(ctx.font);
      // assume that the font shrinking worked
      shrinking = false;
      // reset the ticker
      wc = 0;
      // now add a word a time to the current line
      let addingWords = true;
      // a flag to check whether or not to add a preceding space to the current word
      // which we only do if it's not the first word in the sentence
      let firstWord = true;
      // a string to hold the current line that is being concatenated
      let currentLine = '';
      // the text bottom for the first line
      let textBottom = top + currentFontHeight + 5;

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

      // check that the current array fits within the max height
      let totalHeight = lines.length * (currentFontHeight + linePadding);
      shrinking = totalHeight > maxHeight;
      if(shrinking)
      {
        currentFontHeight *= 0.9;
        linePadding *= 0.9;
        ctx.font = `${currentFontHeight}pt ${font}`;
        lines = [];
        currentLine = '';
      }
    }

    let lineBottom = top + currentFontHeight;
    for(let line of lines)
    {
      ctx.fillText(line, left, lineBottom);
      lineBottom += currentFontHeight + linePadding;
    }
  }

  function blank_meme()
  {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    let good = $good.val();
    let bad = $bad.val();

    wrapMemeText(bad, 365, 5);
    wrapMemeText(good, 365, 365);
  }

  function makeItSo()
  {
    let image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
    let a = this;
    a.href = image;
    a.download = 'Geordi Meme.png';
  }

  $(function(){
    canvas = document.getElementById('gmg');
    canvas.width = canvas.height = 720;

    ctx = canvas.getContext('2d');
    ctx.font = `${currentFontHeight}px ${font}`;

    image.onload = blank_meme;
    image.src = './img/blank.png';

    let urlVars = window.location.href.split('?')[1];
    let parts = {bad:'', good:''};
    if(urlVars)
    {
      console.log(urlVars);
      let urlPairs = urlVars.split('&');
      for(let pair of urlPairs)
      {
        let [key, val] = pair.split('=');
        val = decodeURI(val);
        parts[key.toLowerCase()] = val;
      }
    }

    $bad = $('#meme-bad').val(parts.bad).change(blank_meme);
    $good = $('#meme-good').val(parts.good).change(blank_meme);
    $('#save-meme').click(makeItSo);

  });
})(window.jQuery);
