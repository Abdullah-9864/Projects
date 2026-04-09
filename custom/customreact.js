function customRender(reactElement,container)
{
    const domElement=document.createElement(reactElement.type);
    domElement.innerHTML=reactElement.children;
    for (const prop in reactElement.props) 
    {
        if (prop === 'children') continue;
        domElement.setAttribute(prop, reactElement.props[prop]);

    }
    container.appendChild(domElement);

    // const domElement=document.createElement(reactElement.type);
    // domElement.innerHTML=reactElement.children;
    // domElement.setAttribute('href', reactElement.props.href)
    // domElement.setAttribute('target', reactElement.props.target)
    // container.appendChild(domElement)


}

const reactElement={
    type:'a',
    props:
    {
        
        href:"https://www.google.com",
        target :"_blank"
    },
    children:"click on this link!",
}


const mainContainer= document.getElementById("root");





customRender(reactElement,mainContainer)


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


