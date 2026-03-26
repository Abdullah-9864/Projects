const reactElement={
    type:"h1",
    props:{
        
        href:"https://www.google.com",
        target :"_blank"
    },
    children:"Hello World!",
}


const mainContainer= document.getElementById("root");



function customRender(reactElement,mainContainer)
{
    const domElement=document.createElement(reactElement.type);
    domElement.innderHTML=reactElement.children;
    for (const prop in reactElement.props) {
        if (prop === 'children') continue;
        domElement.setAttribute(prop, reactElement.props[prop]);

    }
    mainContainer.appendChild(domElement);
}
// customRender(reactElement,mainContainer)
// {
//     const domElement=document.createElement(reactElement.type);
//     for(const prop in reactElement.props)
//     {
//         domElement.setAttribute(prop,reactElement.props[prop]);
//     }
//     mainContainer.appendChild(domElement);
//     if(reactElement.children)
//     {
//         domElement.textContent=reactElement.children;
//     }

// }



// const mainContainer=document.querySelector("#root");


