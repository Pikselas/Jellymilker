const BaseURL = "https://api.github.com/repos/Pikselas/jellymilk/contents";
var ActiveContents = "All-Models";

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

function CreateModelCard(name , desc , tags , links)
{
    let card = document.createElement("div");
    card.className = "Content";
    let title = document.createElement("h2");
    title.innerHTML = name;
    let img = document.createElement("img");
    img.className = "profilepic";
    GetFromGithub(`${BaseURL}/profile_pics/${name}.png`).then((res)=>{
        if(res.ok)
        {
            res.blob().then((blob)=>{
                img.src = URL.createObjectURL(blob);
                //revoke after loading complete
                //img.onload = () => {URL.revokeObjectURL(img.src)};
            });
        }
    });
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
            lnk.parentElement.removeChild(lnk);
        }
    });
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
            panelElements[3].insertBefore(lnk , newLink);
        }
    }
    panelElements[3].appendChild(newLink)
    panelElements.push(newLink);
    return panelElements;
}

document.body.onload = async ()=>{
    let c = document.getElementById("Container");
    c.innerHTML = "";
    let models = await GetAllModels();
    models.forEach(model => GetModel(model)            
    .then((model_details)=>
    { 
        c.appendChild(CreateModelCard(model , model_details["description"] , model_details["tags"] , model_details["links"])); 
    }));
}

document.getElementById("ModelsButton").onclick = async ()=>{
    ActiveContents = "All-Models";
    let c = document.getElementById("Container");
    c.innerHTML = "";
    let models = await GetAllModels();
    models.forEach(model => GetModel(model)            
    .then((model_details)=>
    { 
        c.appendChild(CreateModelCard(model , model_details["description"] , model_details["tags"] , model_details["links"])); 
    }));
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
            models.forEach(model => GetModel(model)            
            .then((model_details)=>
            { 
                c.appendChild(CreateModelCard(model , model_details["description"] , model_details["tags"] , model_details["links"])); 
            }));
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
}