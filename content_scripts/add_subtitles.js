(function(){

if(window.has_run){
    var menu = document.getElementById("addsubtitle_menu");
    menu.style.display = menu.style.display == "none" ? "inline-block" : "none";
    return;
}
else{
    if(document.getElementById("addsubtitle_menu") != null){
        document.getElementById("addsubtitle_menu").outerHTML = "";
        document.getElementById("subtitle_element").outerHTML = "";
    }
}
window.has_run = true;

var subtitle_element = document.createElement("div");
subtitle_element.id = "subtitle_element";
document.body.append(subtitle_element);

var video_fullscreen = false;

var menu = document.createElement("div");
menu.id = "addsubtitle_menu";
menu.innerHTML = `
<button id="close_button">Close</button>
<p>
    List of video elements:
    <button id="refresh_video_list">Refresh List</button>
</p>
<p id="video_elements_list">
</p>
<p>
    <button id="make_video_fullscreen">Make video fullscreen</button><br>
    Subtitles file: <input type="file" accept=".srt" id="subtitle_file_input"><br>
    Time offset: <input type="number" step="0.01" id="subtitle_offset_input" value="0"> seconds<br>
    Position offset: <input type="number" id="subtitle_offset_top_input" value="-10"> px<br>
    Font size: <input type="number" id="subtitle_font_size" value="26"> px<br>
    Font : <input type="text" id="subtitle_font" value="Arial"><br>
    Font color: <input type="text" id="subtitle_font_color" value="rgba(255, 255, 255, 1)"><br>
    Background color: <input type="text" id="subtitle_background_color" value="rgba(0, 0, 0, 0.7)"><br>
</p>
`;
document.body.append(menu);

var style = document.createElement("style");
style.type = "text/css";
style.innerHTML = `
#addsubtitle_menu *{
    all: revert;
    font-family: monospace !important;
    font-size: 12px !important;
    line-height: 14px !important;
    letter-spacing: normal !important;
}
#addsubtitle_menu{
    z-index: 100000 !important;
    position: fixed;
    right: 14px;
    bottom: 14px;
    width: 430px;
    border: 1px solid black;
    padding-left: 14px;
    padding-right: 16px;
    padding-top: 12px;
    padding-bottom: 12px;
    background-color: white;
    color: black;
}
#addsubtitle_menu button{
    background-color: white;
    border: 1px solid black;
    color: black;
    padding: 2px;
}
#addsubtitle_menu input:not([type="file"]){
    border: 1px solid black !important;
    box-sizing: border-box !important;
    margin: initial !important;
    padding: initial !important;
    height: 20px !important;
    width: 200px;
}
#video_elements_list{
    margin-top: 8px !important;
}
#video_elements_list div{
    margin-top: 0px !important;
    border: 1px solid black;
    margin-top: -1px !important;
    padding: 3px !important;
    cursor: pointer !important;
}
.selected_video_list{
    border: 2px solid red !important;
}
.hover_video_list{
    border: 2px solid red !important;
}
.hover_video_element{
    border: 4px solid red !important;
}
#subtitle_element{
    text-align: center;
    pointer-events: none;
}
.subtitle_line{
    display: inline-block;
    text-align: center;
    z-index: 99999;
}
#addsubtitle_menu br{
    margin: 0px;
    margin-top: 15px !important;
}
#addsubtitle_menu #close_button{
    position: absolute;
    top: 2px;
    right: 2px;
}
#addsubtitle_menu p{
    margin: 0px;
}
`;
document.getElementsByTagName("head")[0].appendChild(style);

var the_video_element = null;

function update_video_elements_list(){
    var video_elements = document.getElementsByTagName("video");
    var video_elements_list = document.getElementById("video_elements_list");
    video_elements_list.innerHTML = "";
    if(video_elements.length == 0){
        video_elements_list.innerHTML = "No video elements found.<br>If your video is inside and iframe, press shift+right click on it then \"This Frame\" > \"Open Frame in New Tab\""
    }
    for(var i = 0; i < video_elements.length; i++){
        var video_list_item = document.createElement("div");
        video_list_item.className = "video_list_item";
        video_list_item.textContent = video_elements[i].currentSrc;
        (function(){
            var current_video_element = video_elements[i];
            video_list_item.addEventListener("mouseenter", function(){
                this.classList.add("hover_video_list");
                current_video_element.classList.add("hover_video_element");
            });
            video_list_item.addEventListener("mouseleave", function(){
                this.classList.remove("hover_video_list");
                current_video_element.classList.remove("hover_video_element");
            });
            video_list_item.addEventListener("click", function(){
                var list = document.getElementsByClassName("video_list_item");
                for(var i = 0; i < list.length; i++){
                    list[i].classList.remove("selected_video_list");
                }
                if(the_video_element == current_video_element){
                    the_video_element = null;
                    subtitle_element.innerHTML = "";
                }
                else{
                    the_video_element = current_video_element;
                    this.classList.add("selected_video_list");
                }
            });
        }());
        video_elements_list.append(video_list_item);
    }
}

var subtitle_element = document.getElementById("subtitle_element");
var subtitle_offset = parseFloat(document.getElementById("subtitle_offset_input").value);
var subtitle_offset_top = parseFloat(document.getElementById("subtitle_offset_top_input").value);

var subtitles = [];

var subtitle_font = document.getElementById("subtitle_font").value;
var subtitle_font_size = document.getElementById("subtitle_font_size").value;
var subtitle_font_color = document.getElementById("subtitle_font_color").value;
var subtitle_background_color = document.getElementById("subtitle_background_color").value;

setInterval(function(){
    if(subtitles.length == 0) return;
    var t = the_video_element.currentTime;
    var found = -1;
    for(var i = 0; i < subtitles.length; i++){
        if(subtitles[i].begin+subtitle_offset <= t && subtitles[i].end+subtitle_offset >= t){
            found = i;
            break;
        }
    }
    if(found == -1){
        subtitle_element.textContent = "";
    }
    else{
        subtitle_element.innerHTML = "";
        for(var i = 0; i < subtitles[found].text.length; i++){
            var subtitle_line = document.createElement("div");
            subtitle_line.textContent = subtitles[found].text[i];
            subtitle_line.className = "subtitle_line";
            subtitle_line.style.cssText = "font-family: "+subtitle_font+";font-size: "+subtitle_font_size+"px;color:"+subtitle_font_color+";background-color:"+subtitle_background_color+";";
            subtitle_element.appendChild(subtitle_line);
            subtitle_element.appendChild(document.createElement("br"));
        }
    }
    subtitle_pos();
}, 100);

function get_offset(e){
    var top = 0;
    var left = 0;
    do {
        top += e.offsetTop || 0;
        left += e.offsetLeft || 0;
        e = e.offsetParent;
    } while(e);
    return [top, left];
}

function subtitle_pos(){
    var subtitle_height = subtitle_element.getBoundingClientRect().height;
    if(video_fullscreen){
        var sub_pos_top = the_video_element.getBoundingClientRect().top+the_video_element.offsetHeight+subtitle_offset_top-subtitle_height;
        var sub_pos_left = get_offset(the_video_element)[1];
        subtitle_element.style.position = "fixed";
        subtitle_element.style.width = the_video_element.offsetWidth+"px";
        subtitle_element.style.top = sub_pos_top+"px";
        subtitle_element.style.left = sub_pos_left+"px";
    }
    else{
        var the_video_element_height = the_video_element.offsetHeight;
        var the_video_element_top = get_offset(the_video_element)[0];

        var sub_pos_top = the_video_element_height+the_video_element_top+subtitle_offset_top-subtitle_height;
        var sub_pos_left = get_offset(the_video_element)[1];

        subtitle_element.style.position = "absolute";
        subtitle_element.style.width = the_video_element.offsetWidth+"px";
        subtitle_element.style.top = sub_pos_top+"px";
        subtitle_element.style.left = sub_pos_left+"px";
    }
    subtitle_element.style.zIndex = "99999";
}

function time_parse(t){
    var split = t.split(":");
    var hours = split[0]*60*60;
    var minutes = split[1]*60;
    var seconds = parseFloat(t.split(":")[2].replace(",", "."));
    return hours+minutes+seconds;
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
        subtitles.push({begin: time_parse(time[0]), end: time_parse(time[1]), text: text});
    }
}

function switch_fullscreen_video(){
    if(the_video_element == null) return;

    document.documentElement.requestFullscreen();

    video_fullscreen = true;

    if(!document.getElementById("fullscreen_video_black_background")){
        var black_background = document.createElement("div");
        black_background.id = "fullscreen_video_black_background";
        black_background.style.backgroundColor = "black";
        black_background.style.margin = "0px";
        black_background.style.padding = "0px";
        black_background.style.position = "absolute";
        black_background.style.top = "0px";
        black_background.style.left = "0px";
        black_background.style.zIndex = "99997";
        black_background.style.width = "100%";
        black_background.style.height = "100%";
        document.body.append(black_background);
    }

    document.getElementById("subtitle_element").style.zIndex = "99999";
    document.documentElement.style.overflow = "hidden";
    the_video_element.style.position = "fixed";
    the_video_element.style.top = "0px";
    the_video_element.style.left = "0px";
    the_video_element.style.zIndex = "99998";
    the_video_element.style.width = "100%";
    the_video_element.style.height = "100%";
}

update_video_elements_list();
document.getElementById("refresh_video_list").addEventListener("click", function(){
    update_video_elements_list();
});

document.getElementById("subtitle_file_input").addEventListener("change", function(){
    var subtitle_file = this.files[0];
    var file_reader = new FileReader();
    file_reader.onload = (function(reader){
        return function(){
            parse_subtitles(reader.result);
        }
    })(file_reader);
    file_reader.readAsText(subtitle_file);
});

document.getElementById("subtitle_offset_input").addEventListener("change", function(){
    subtitle_offset = parseFloat(document.getElementById("subtitle_offset_input").value);
});

document.getElementById("subtitle_offset_top_input").addEventListener("change", function(){
    subtitle_offset_top = parseFloat(document.getElementById("subtitle_offset_top_input").value);
});

document.getElementById("subtitle_font_size").addEventListener("change", function(){
    subtitle_font_size = this.value;
});

document.getElementById("subtitle_font_color").addEventListener("change", function(){
    subtitle_font_color = this.value;
});

document.getElementById("subtitle_background_color").addEventListener("change", function(){
    subtitle_background_color = this.value;
});

document.getElementById("subtitle_font").addEventListener("change", function(){
    subtitle_font = this.value;
});

document.getElementById("make_video_fullscreen").addEventListener("click", function(){
    switch_fullscreen_video();
});

document.getElementById("close_button").addEventListener("click", function(){
    menu.style.display = "none";
});

})();