(function(){

if(window.has_run){
    return;
}
window.has_run = true;

// make this switch tooltip
// make tooltip an iframe
// make it work in fullscreen

var sub_element = document.createElement("div");
sub_element.id = "subtitle__";
document.body.append(sub_element);

var menu = document.createElement("div");
menu.id = "option__";
menu.innerHTML = `
<p id="video_elements_list">
</p>
<p>
    Subtitles file: <input type="file" accept=".srt" id="subtitle_file_input">
</p>
<p>
    Offset: <input type="number" step="0.01" id="subtitle_offset_input"> seconds
</p>
<p>
    Position offset: <input type="number" id="subtitle_position_input"> seconds
</p>
<p>
    Subtitles style:<br>
    <textarea id="subtitle_style_input"></textarea>
</p>
`;
document.body.append(menu);

var style = document.createElement("style");
style.type = "text/css";
style.innerHTML = `
#option__{
    font-size: inital !important;
    background-color: white !important;
    display: inline-block !important;
    z-index: 99999999 !important;
    position: fixed !important;
    right: 14px !important;
    bottom: 14px !important;
    width: 400px !important;
    border: 1px solid black !important;
    padding-left: 14px !important;
    padding-right: 16px !important;
}
#option__ input:not([type="file"]), #option__ textarea{
    background-color: white !important;
    border: 1px solid black !important;
    box-sizing: border-box !important;
}
#option__ *{
    font-family: monospace !important;
}
#subtitle_style_input{
    width: 100% !important;
    min-height: 100px !important;
}
#video_elements_list div{
    border: 1px solid black !important;
    margin-top: -1px !important;
    padding: 3px !important;
    cursor: pointer !important;
}
`;
document.getElementsByTagName("head")[0].appendChild(style);

var video_elements = document.getElementsByTagName("video");
var video_element;
var video_elements_list = document.getElementById("video_elements_list");

for(var i = 0; i < video_elements.length; i++){
    var v = document.createElement("div");
    v.className = "video_el";
    v.innerHTML += "id: "+video_elements[i].id;
    (function(){
        var original_outline = video_elements[i].style.outline;
        var video_el = video_elements[i];
        v.addEventListener("mouseenter", function(){
            video_el.style.outline = "4px solid red";
        });
        v.addEventListener("mouseleave", function(){
            video_el.style.outline = original_outline;
        });
        v.addEventListener("click", function(){
            video_element = video_el;
            var list = document.getElementsByClassName("video_el");
            for(var i = 0; i < list.length; i++){
                list[i].style.border = "";
            }
            this.style.border = "2px solid red";
            subtitle_pos();
        });
    }());
    video_elements_list.append(v);
}

var subtitle_element = document.getElementById("subtitle__");
var default_style = `font-family: sans-serif;
font-size: 26px;
color: white;
text-shadow: 0px 0px 3px black;
text-align: center;
pointer-events: none;`;
document.getElementById("subtitle_style_input").value = default_style;
subtitle_element.style = default_style;
document.getElementById("subtitle_offset_input").value = 0;
document.getElementById("subtitle_position_input").value = -50;
var subtitle_offset = parseFloat(document.getElementById("subtitle_offset_input").value);
var subtitle_position = parseFloat(document.getElementById("subtitle_position_input").value);

var subtitles = [];

setInterval(function(){
    if(subtitles.length == 0) return;
    var t = video_element.currentTime;
    var found = -1;
    for(var i = 0; i < subtitles.length; i++){
        if(subtitles[i].begin+subtitle_offset <= t && subtitles[i].end+subtitle_offset >= t){
            found = i;
            break;
        }
    }
    if(found == -1){
        subtitle_element.innerHTML = "";
    }
    else{
        subtitle_element.innerHTML = subtitles[found].text;
    }
}, 100);

function subtitle_pos(){
    var sub_pos_top = video_element.offsetHeight+video_element.offsetTop+subtitle_position;
    var sub_pos_left = video_element.offsetLeft;
    subtitle_element.style.position = "absolute";
    subtitle_element.style.width = video_element.offsetWidth+"px";
    subtitle_element.style.top = sub_pos_top+"px";
    subtitle_element.style.left = sub_pos_left+"px";
}

function time_parse(t){
    return parseInt(t.split(":")[0])*60+ parseInt(t.split(":")[1])*60+parseFloat(t.split(":")[2].replace(',', '.'));
}

function parse_subtitles(subs){
    subs = subs.replace(/\r/g, "");
    subs = subs.split("\n\n");

    for(var i = 0; i < subs.length; i++){
        s = subs[i].split("\n");
        time = s[1].split(" --> ");
        text = [];
        for(var j = 2; j < s.length; j++){
            text.push(s[j]);
        }
        subtitles.push({begin: time_parse(time[0]), end: time_parse(time[1]), text: text.join("<br>")});
    }
}

document.getElementById("subtitle_file_input").addEventListener("change", function(){
    var subtitle_file = this.files[0];
    var file_reader = new FileReader();
    file_reader.onload = (function(reader){
        return function(){
            parse_subtitles(reader.result);
        }
    })(file_reader);
    file_reader.readAsText(subtitle_file);
    subtitle_pos();
});

document.getElementById("subtitle_offset_input").addEventListener("change", function(){
    subtitle_offset = parseFloat(document.getElementById("subtitle_offset_input").value);
});

document.getElementById("subtitle_position_input").addEventListener("change", function(){
    subtitle_position = parseFloat(document.getElementById("subtitle_position_input").value);
    subtitle_pos();
});

document.getElementById("subtitle_style_input").addEventListener("change", function(){
    subtitle_element.style = document.getElementById("subtitle_style_input").value;
    subtitle_pos();
});
})();