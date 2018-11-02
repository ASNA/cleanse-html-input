## Removing smart quotes and other offending characters from HTML input

A customer reported a frustrating challenge with a Monarch application (Monarch is ASNA's analytical/migration suite that transforms green-screen RPG into C# or AVR with a Web-based user interface). This challenge could also be present in ASNA Wings, Mobile RPG, and Visual RPG Web apps. 

The customer's Monarch app had a screen with several multi-line textboxes (which render as HTML textarea tags). These text areas are used to record notes about customer discussions. The challenge was that some users were cutting and passing their notes from a Word document into the text areas. Many times when they did this the pasted text included "[smart quotes](https://newrepublic.com/article/113101/smart-quotes-are-killing-apostrophe)", as shown in Figure 1a below:

![](https://asna.com/filebin/marketing/article-figures/text-cleanse-fig1.png?d)

<small>Figure 1a. Text with smart quotes</small>

This data gets successfully written to files in the IBM i's DB2 database; the problem occurs when it's fetched later and displayed later. On a traditional green screen. The least that can happen is that the character's can't be displayed and IBM i substibutes question marks for offending characters, as shown below in Figure 1b. 

![](https://asna.com/filebin/marketing/article-figures/text-cleanse-fig2.png?d)

<small>Figure 1b. Incorrectly rendered text with smart quotes.</small>

However, the problems aren't just cosmetic, some IBM i apps may not display the data at all or have trouble reading the record which results in the error message: 

    The retrieved record contains invalid data.
    
When the data is displayed in browsers, you'll usually see unusual characters swapped in for the offending characters (in Chrome it's a right-arrow character).     

To avoid this problem, you need to remove any offending characters before the database is saved to disk. You could conceivably do this on the IBM i with a before-update trigger, but that might be swinging a pretty big hammer at a very localized issue. This incorrect data input is only possible from a browser, so you could also use JavaScript to fix the issue. That's the solution offered here. 

The JavaScript below shows a way to cleanse input data from a Web page. It works by registering itself to any input element with a `stop-chars` CSS class name. For ASP.NET controls, the class name is specified with the CSSCLass property, otherwise specify it in the HTML markup. No other code is required to hook this JavaScript up. When an input element (those that are or render to with `input` or `textarea` tags) with a `stop-chars` CSS class loses focus (its `blur` event), its input is stripped of offending characters. 

The are two kinds of offending characters:

1. Known offenders such as smart quotes, bullets and emdashes. 
2. Unknown offenders which are offending characters you weren't expecting.

For known offenders, this JavaScript swaps out the offending character with a given replacement (ie, a bullet is replaced with an asterisk). These are clearly commented in the code and you can add others as needed. 

For unknown offenders, offending characters are replaced with a generic substibute (which, by default is a blank character.) Unknown offending characters are assumed to be those with a unicode value greater than or equal to 20 and less than or equal to 127 (these are the characters than are in [Unicode's basic Latin character set](https://unicode-table.com/en/#basic-latin)). These values are controlled by constants and are easy to change the rnage of offending characters you need to accept. 

[You can see the code below in action here.](https://asna.github.io/cleanse-html-input/index.html)

    "use strict";
    
    (function() {
        // Identify text area elements and assign reformatTextArea() function
        // to their `blur` (which is lost focus) events.
        // Assign the CSS class 'strip-chars' any text or textarea elements 
        // you need "cleansed."
        const sourceAreas = document.querySelectorAll('.strip-chars');
        for (let i=0; i<sourceAreas.length; i++) {
            sourceAreas[i].addEventListener('blur', function() {
                cleanseElement(this)
            })    
        }
    
        // Replace offending Unicode characters. Add others as needed.
        function cleanseText(text) {
            const HIGHEST_POSSIBLE_CHAR_VALUE = 127
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
                if (strippedText.charCodeAt(i) <= HIGHEST_POSSIBLE_CHAR_VALUE ) {
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
    
