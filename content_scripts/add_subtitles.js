(function(){

if(window.has_run){
    return;
}
window.has_run = true;

var menu = document.createElement("div");
menu.innerHTML = `
    Subtitle file: <input type="file" accept=".srt" id="subtitle_file_input">
`;
document.body.append(menu);


})();