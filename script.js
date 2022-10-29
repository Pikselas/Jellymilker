const BaseURL = "https://api.github.com/repos/Pikselas/jellymilk/contents";

async function GetFromGithub(url)
{
    let res = await fetch(url , {"headers":{"Accept":"application/vnd.github.v3.raw","Authorization" : `Bearer ${AccessToken}`}});
    return res;
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
        return await res.json();
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
                img.onload = () => {URL.revokeObjectURL(img.src)};
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
        let baseurl = link.split("/")[2];
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
    return card;
}

document.body.onload = async ()=>{
    let c = document.getElementById("Container");
    c.innerHTML = "";
    let models = await GetAllModels();
    models.forEach(async (model)=>{
        let model_details = await GetModel(model);
        let card = CreateModelCard(model , model_details["description"] , model_details["tags"] , model_details["links"]);
        c.appendChild(card);
    });
}