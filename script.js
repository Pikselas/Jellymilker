const BaseURL = "https://api.github.com/repos/Pikselas/jellymilk/contents";
var ActiveContents = "All-Models";
var AllModels = {};
var AllModelMedia = {};
async function UploadToGithub(url, content , msg = "NEW COMMMIT")
{
   let res =  await fetch(url,{
        "method":"PUT",
        "headers" : {
                "Accept":"application/vnd.github+json",
                "Authorization" : `Bearer ${AccessToken}`},
        "body": JSON.stringify({
                "message":msg,
                "committer":{
                    "name":Committer,
                    "email": Email
                },"content": btoa(content)
            })
    });
    return [res.status , await res.json()];
}

async function GetFromGithub(url)
{
    return await fetch(url , {"headers":{"Accept":"application/vnd.github.v3.raw","Authorization" : `Bearer ${AccessToken}`}});
}

async function GetModelTypes()
{
    let res = await GetFromGithub(`${BaseURL}/data/categories.json`);
    if(res.ok)
    {
        return (await res.json())["categories"];
    }
}

async function GetModels(modelType)
{
    let res = await GetFromGithub(`${BaseURL}/data/categories/${modelType}.json`);
    if(res.ok)
    {
        return (await res.json())["models"];
    }
}

async function GetAllModels()
{
    let res = await GetFromGithub(`${BaseURL}/profile_pics`);
    if (res.ok)
    {
        let j = await res.json();
        let models = [];
        j.forEach((item)=>{
            models.push(item.name.split(".").slice(0,-1).join("."));
        });
        return models;
    }
}

async function GetModel(name)
{
    let res = await GetFromGithub(`${BaseURL}/data/models/${name}.json`);
    if(res.ok)
    {
        return await res.json();
    }
}

function CreateModelCard(name , desc , tags , links , imgurl)
{
    let card = document.createElement("div");
    card.className = "Content";
    let title = document.createElement("h2");
    title.innerHTML = name;
    let img = document.createElement("img");
    img.className = "profilepic";
    img.src = imgurl;
    let Tags = document.createElement("div");
    Tags.className = "Tags";
    tags.forEach((tagname)=>{
        let tag = document.createElement("button");
        tag.className = "Tag";
        tag.innerHTML = tagname;
        Tags.appendChild(tag);
    });
    let Links = document.createElement("div");
    Links.className = "Links";
    links.forEach((link)=>{
        let lnk = document.createElement("a");
        lnk.href = link;
        lnk.target = "_blank";
        //get the base url of link
        let baseurl = link.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
        let icon = document.createElement("img");
        //get the icon of the base url 32 px
        icon.src = `https://www.google.com/s2/favicons?domain=${baseurl}&sz=32`;
        lnk.appendChild(icon);
        Links.appendChild(lnk);
    });
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(Tags);
    card.appendChild(Links);

    card.onclick = ()=>{
        let panelElements = CreateEditModelPanel(img.src , desc , links);
        card.parentElement.appendChild(panelElements[0]);
    }

    return card;
}

function CreateAddCategoryPanel()
{
    let panel = document.createElement("div");
    panel.className = "CategoryAddPanel";
    let title = document.createElement("h2");
    title.innerHTML = "Add Category";
    let input = document.createElement("input");
    input.placeholder = "Category Name";
    let button = document.createElement("button");
    button.className = "AddButton";
    button.innerHTML = "Add";
    button.onclick = async ()=>{
        // let res = await GetFromGithub(`${BaseURL}/data/categories.json`);
        // if(res.ok)
        // {
        //     let j = await res.json();
        //     j["categories"].push(input.value);
        //     let res = await fetch(`${BaseURL}/data/categories.json` , {"method":"PUT" , "headers":{"Accept":"application/vnd.github.v3.raw","Authorization" : `Bearer ${AccessToken}` , "Content-Type" : "application/json"} , "body":JSON.stringify(j)});
        //     if(res.ok)
        //     {
        //         alert("Category Added");
        //     }
        // }
    }
    panel.appendChild(title);
    panel.appendChild(input);
    panel.appendChild(button);
    return panel;
}

function CreateBaseModelPanel()
{
    let panel = document.createElement("div");
    panel.className = "ModelPanel";
    let ProfileImageSection = document.createElement("div");
    ProfileImageSection.className = "ProfileImageSection";
    let ProfileImage = document.createElement("img");
    ProfileImage.className = "ProfileImage";
    let ItemsArea = document.createElement("div");
    ItemsArea.className = "Items Div";
    let DescArea = document.createElement("input");
    DescArea.className = "DescArea";
    DescArea.placeholder = "How angelic is this model?";
    let Links = document.createElement("div");
    Links.className = "Links";
    let save = document.createElement("button");
    save.innerHTML = "Save";
    let Close = document.createElement("button");
    Close.className = "Close";
    Close.innerHTML = "X";
    Close.onclick = ()=>{
        panel.remove();
    }
    let newLink = document.createElement("div");
    newLink.className = "Link Add"
    newLink.innerHTML = "+";
    newLink.onclick = ()=>{
        let l = prompt("Enter Link");
        if(l)
        {
            let lnk = document.createElement("div");
            lnk.className = "Link Delete";
            lnk.title = l;
            lnk.innerHTML = l.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0]
            lnk.onclick = ()=>{
                lnk.remove();
            }
            Links.insertBefore(lnk , newLink.nextSibling);
        }
    }
    Links.appendChild(newLink);
    ProfileImageSection.appendChild(ProfileImage);
    panel.appendChild(ProfileImageSection);
    ItemsArea.appendChild(Close);
    ItemsArea.appendChild(DescArea);
    ItemsArea.appendChild(Links);
    ItemsArea.appendChild(save);
    panel.appendChild(ItemsArea);
    return [panel , ProfileImage , DescArea , Links , save];
}

function CreateAddModelPanel()
{
    let panelElements = CreateBaseModelPanel();
    panelElements[1].src = "./icons/add-profile.png";
    panelElements[1].className += " Add";
    let file = document.createElement("input");
    file.type = "file";
    file.accept = "image/*";
    file.onchange = ()=>{
        let reader = new FileReader();
        reader.onload = ()=>{
            panelElements[1].className = "ProfileImage";
            panelElements[1].src = reader.result;
        }
        reader.readAsDataURL(file.files[0]);
    }
    panelElements[1].onclick = ()=>{
        file.click();
    }
    return [panelElements[0] , file , panelElements[2] , panelElements[3] , panelElements[4]];
}

function CreateEditModelPanel(imgurl , desc , links)
{
    let panelElements = CreateBaseModelPanel();
    panelElements[1].src = imgurl;
    panelElements[2].value = desc;
    links.forEach((link)=>{
        let lnk = document.createElement("div");
        lnk.className = "Link Delete";
        lnk.title = link;
        lnk.innerHTML = link.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0]
        panelElements[3].appendChild(lnk);
        lnk.onclick = ()=>{
            lnk.remove();
        }
    });
    return panelElements;
}

function CreateModelsSelector(onSelect = (selectedarr = [])=>{} , models = {"name":"pic"})
{
    let panel = document.createElement("div");
    panel.className = "ModelSelector";
    let ModelsArea = document.createElement("div");
    ModelsArea.className = "ModelsArea";
    Object.keys(models).forEach((name)=>{
        let model = document.createElement("div");
        model.className = "Model";
        let img = document.createElement("img");
        img.src = models[name];
        let title = document.createElement("div");
        title.innerHTML = name;
        let checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.value = name;
        model.appendChild(img);
        model.appendChild(title);
        model.appendChild(checkBox);
        ModelsArea.appendChild(model);
    });
    let CloseButton = document.createElement("button");
    CloseButton.className = "CloseButton";
    CloseButton.innerHTML = "X";
    CloseButton.onclick = ()=>{
        panel.remove();
    }
    let Addbutton = document.createElement("button");
    Addbutton.className = "AddButton";
    Addbutton.innerHTML = "+";
    Addbutton.onclick = ()=>{
        onSelect(Array.from(ModelsArea.querySelectorAll("input[type=checkbox]:checked")).map((e)=>{return e.value}));
    }
    panel.appendChild(CloseButton);
    panel.appendChild(ModelsArea);
    panel.appendChild(Addbutton);
    return panel
}

document.body.onload = async ()=>{
    let c = document.getElementById("Container");
    c.innerHTML = "";
    let models = await GetAllModels();
    models.forEach(model => GetModel(model)            
    .then((model_details)=>
    { 
        AllModels[model] = model_details;
        GetFromGithub(`${BaseURL}/profile_pics/${model}.png`).then((res)=>{
            if(res.ok)
            {
                res.blob().then((blob)=>{
                 AllModelMedia[model] = URL.createObjectURL(blob);
                });
            }
        });
    }));
}

document.getElementById("ModelsButton").onclick = async ()=>{
    ActiveContents = "All-Models";
    let c = document.getElementById("Container");
    c.innerHTML = "";
    let models = Object.keys(AllModels);
    models.forEach(model => {
        c.appendChild(CreateModelCard(model , AllModels[model]["description"] , AllModels[model]["tags"] , AllModels[model]["links"],AllModelMedia[model])); 
    });
}

document.getElementById("TagsButton").onclick = async ()=>{
    ActiveContents = "All-Tags";
    let c = document.getElementById("Container");
    c.innerHTML = "";
    let types = await GetModelTypes();
    types.forEach((type)=>{
        let card = document.createElement("div");
        card.onclick = async ()=>{
            let c = document.getElementById("Container");
            c.innerHTML = "";
            let models = await GetModels(type);
            models.forEach(model => {
                c.appendChild(CreateModelCard(model , AllModels[model]["description"] , AllModels[model]["tags"] , AllModels[model]["links"],AllModelMedia[model])); 
            });
            ActiveContents = "Tag-" + type;
        }
        card.className = "Content Tag";
        let title = document.createElement("h2");
        title.innerHTML = type;
        card.appendChild(title);
        c.appendChild(card);
    });
}

document.getElementById("AddButton").onclick = async ()=>{
    let c = document.getElementById("Container");
    if(ActiveContents == "All-Tags")
    {
        c.appendChild(CreateAddCategoryPanel());
    }
    else if(ActiveContents == "All-Models")
    {
        let nam = prompt("Enter Name")
        if(nam != null)
        {
            const panelElements = CreateAddModelPanel();
            c.appendChild(panelElements[0]);
            panelElements[4].onclick = ()=>{
                let Jso = {}
                Jso["description"] = panelElements[2].value;
                Jso["links"] = []
                for(let i = 1 ; i < panelElements[3].children.length; ++i)
                {
                Jso["links"].push(panelElements[3].children[i].title);
                }
                Jso["tags"] = [];
                let reader = new FileReader()
                reader.onload = (ev) =>{
                    Promise.all([
                        UploadToGithub(BaseURL + "/data/models/" + nam + ".json",JSON.stringify(Jso,null,4),"ADDED MODEL-DESC:" + nam),
                        UploadToGithub(BaseURL + "/profile_pics/" + nam + ".png",ev.target.result , "ADDED MODEL-PIC:"+ nam)
                    ]).then(res => {
                        alert("ADDED MODEL " + nam)
                        panelElements[0].remove();
                    }).catch(er => {
                        alert("CAN'T ADD MODEL")
                    })  
                }
                reader.readAsBinaryString(panelElements[1].files[0])
            }
        }
    }
    else
    {
        let tag = ActiveContents.split("-");
        if(tag[0] =="Tag" && tag[1] != undefined)
        {
            c.appendChild(CreateModelsSelector((selectedarr)=>{
                console.log(selectedarr);
            },AllModelMedia));
        }
    }
}