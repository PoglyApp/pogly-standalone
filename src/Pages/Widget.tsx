export const WidgetPage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const b64 = urlParams.get("b64");
    if(!b64) return(<></>);
    const parsed = decodeURIComponent(atob(b64));

    document.body.innerHTML = parsed.substring(parsed.indexOf("<body>"),parsed.indexOf("<script>")-1)+"</body>";
    document.head.innerHTML = parsed.substring(parsed.indexOf("<head>"),parsed.indexOf("</head>")+7);

    var script = document.createElement("script");
    script.innerHTML = parsed.substring(parsed.indexOf("<script>")+8,parsed.indexOf("</script>"));
    
    document.head.appendChild(script);
    return (<></>);
};
