"use strict";

(function() {
    // Identify text area elements and assign reformatTextArea() function
    // to their `blur` (which is lost focus) events.
    // Assign the CSS class 'strip-chars' any text or textarea elements 
    // you need "cleansed."
    const sourceAreas = document.querySelectorAll('.strip-chars');
    for (let i=0; i<sourceAreas.length; i++) {
        // Remove this line in production. 
        sourceAreas[i].value = 'The reorder was for “blue socks”';
        sourceAreas[i].addEventListener('blur', function() {
            cleanseElement(this)
        })    
    }

    // Replace offending Unicode characters. Add others as needed.
    function cleanseText(text) {
        const LOWEST_POSSIBLE_CHAR_VALUE = 20;
        const HIGHEST_POSSIBLE_CHAR_VALUE = 127;
        const GENERIC_REPLACEMENT_CHAR = ' ';
        let goodChars = [];

        // Swap out known offenders. Add others as needed.        
        // https://unicode-table.com/en/#basic-latin
        let strippedText = text
            .replace(/[\u2014]/g, "--")        // emdash
            .replace(/[\u2022]/g, "*")         // bullet
            .replace(/[\u2018\u2019]/g, "'")   // smart single quotes
            .replace(/[\u201C\u201D]/g, '"');  // smart double quotes

        // Strip out any other offending characters.
        for (let i=0; i < strippedText.length; i++) {
            if (strippedText.charCodeAt(i) >= LOWEST_POSSIBLE_CHAR_VALUE  && 
                strippedText.charCodeAt(i) <= HIGHEST_POSSIBLE_CHAR_VALUE ) {
                goodChars.push(strippedText.charAt(i));
            }
            else {
                goodChars.push(GENERIC_REPLACEMENT_CHAR);
            }
        }            

        return goodChars.join('');
    };    

    function cleanseElement(element) {
        element.value = cleanseText(element.value);
    }
})();
