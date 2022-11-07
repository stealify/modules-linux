# run
Used by components to execute them self or other components mainly used to create component-manager components or operator components but also used to build runtimes and executeables for other systems.

Run is mainly implemented as Stream read or write operation  done via pipeTo. pipeThrough allows composition 
while you can also


```ts
import { ReadableStream } from 'node:stream/web';
import { setInterval as every } from 'node:timers/promises';
import { performance } from 'node:perf_hooks';

const doEvery = (msAsInt, action = prerformance.now) => new ReadableStream({
  async start(controller) {
    for await (const _ of every(msAsInt))
      controller.enqueue(action());
  }
});

const SECOND = 1000;
for await (const value of doEvery(SECUND, performance.now))  {
    console.log(value);
}

const Event = (eventName) => ({
    from: (Source) => new ReadableStream({
        start: controller => Source.addEventListener(eventName, ev => controller.enqueue(ev), false),
        close: () => Source.removeListener(eventName, ev =>controller.enqueue(ev))
    }),
})

const Element = (Source) => {
    getEvents: (eventName) => new ReadableStream({
        start: controller => Source.addEventListener(eventName, ev => controller.enqueue(ev), false),
        close: () => Source.removeListener(eventName, ev => controller.enqueue(ev))
    }),
})

for (const click of Element(document.getElementById("my-button")).getEvents("click")) {

}

for (const blure of Element(document.getElementById("my-button")).getEvents("blure")) {

}


// RunEffect
new ReadableStream({
    start: controller => window.addEventListener("data", x=> controller.enqueue(x), false),
    close: () => window.removeListener("data", x=>controller.enqueue(x))
})).pipeTo(new WriteableStream())


/* events fired on the draggable target */ 
let dragged;
const drag = document.getElementById("draggable");

for (const drag of Element(drag).getEvents("drag")) {
    console.log("dragging");
}

for (const dragStart of Element(drag).getEvents("dragstart")) {
  dragged = dragStart.target;
  dragged.classList.add("dragging");
}

for (const dragEnd of Element(drag).getEvents("dragend")) {
  dragEnd.target.classList.remove("dragging");
}


/* events fired on the drop targets */
const target = document.getElementById("droptarget");

target.addEventListener("dragover", (event) => {
  event.preventDefault(); // prevent default to allow drop
}, false);

target.addEventListener("dragenter", (event) => {
  if (event.target.classList.contains("dropzone")) {
    event.target.classList.add("dragover");
  }
});

target.addEventListener("dragleave", (event) => {
  if (event.target.classList.contains("dropzone")) {
    event.target.classList.remove("dragover");
  }
});

target.addEventListener("drop", (event) => {
  event.preventDefault(); // prevent default to allow drop
  if (event.target.classList.contains("dropzone")) {
    event.target.classList.remove("dragover");
    dragged.parentNode.removeChild(dragged);
    event.target.appendChild(dragged);
  }
});

const assignHandlers = (el, events) => {
    for (const key of Object.keys(events)) {
        el.on(key,events[key]);
    }
}

assignHandlers(button,{ 
    click(){},
    drag(){},
});


// if you pass in a observer
const readMutations = (
    targetNode=document.getElementById('some-id'),
    config={ attributes: true, childList: true, subtree: true },
) => new ReadableStream({
    start: (controller) =>
        (new MutationObserver(...x => controller.enqueue(x)))
            .observe(targetNode, config),
    close: () => observer.disconnect(),
});


const listen = (
    target=document.getElementById('some-id'),
    tags = {
        "my-element": () => console.log(' mutation on my-element'),,
    },
    changes = {
        childList: () => elementDefinitions[mutation.target.tagName],
        attributes: () => console.log(`The ${mutation.attributeName} attribute was modified. on mutation.target`),
    }
    subtree = true,
) => {
    for (const [mutationList, observer] of readMutations(
        target,
        { attributes: !!changes.attributes, childList: !!changes.childList, subtree },
    )) {
        for (const mutation of mutationList) {
    
            //changes[mutation.type](mutation)
            //tags[mutation.target.tagName]()
            
            //if (true) {
                // when this object now mutates it will fire mutation
                // observer.observe(targetNode, config);
            //}    
        }
    }
}
listen(
    window,
    {
        // do something when the tag is mutated
        "my-element": () => console.log(' mutation on my-element'),,
    },
    {   // do something when then 
        childList: (mutation) => elementDefinitions[mutation.target.tagName],
        attributes: (mutation) => console.log(`The ${mutation.attributeName} attribute was modified. on mutation.target`),
    }
    true,
    
)



const createEl = (tagName, propertys) => (el = document.createElement(tagName)), Object.keys(propertys).forEach(propName=>Object.assign(el[propName], propertys[propName]));

const composeEl = (el1,el2) => (el1.appendChild(el2), el1);

composeEl(createEl("span", {
    style: {
        backgroundColor: "initial",
        backgroundImage: "linear-gradient(#fff 0, rgba(255, 255, 255, 0) 100%)",
        borderRadius: "125px",
        content: "",
        height: "50%",
        left: "4%",
        opacity: ".5",
        position: "absolute",
        top: 0,
        transition: "all .3s",
        width: "92%",
    }
}),createEl("button", { 
    style: {
        backgroundColor: "#0078d0",
        border: 0,
        borderRadius: "56px",
        color: "#fff",
        cursor: "pointer",
        display: "inline-block",
        fontFamily: "system-ui,-apple-system,system-ui,"Segoe UI",Roboto,Ubuntu,"Helvetica Neue",sans-serif",
        fontSize: "18px",
        fontWeight: "600",
        outline: 0,
        padding: "16px 21px",
        position: "relative",
        textAlign: "center",
        textDecoration: "none",
        transition: "all .3s",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "manipulation",
    },
    onclick: () => {},
    onhover: (ev) => {
         Object.assign(ev.target.style, {
            box-shadow: "rgba(255, 255, 255, .2) 0 3px 15px inset, rgba(0, 0, 0, .1) 0 3px 5px, rgba(0, 0, 0, .1) 0 10px 13px",
            transform: "scale(1.05)"
        })
    }
}));



// @media (min-width: 768px) {
//   .button-71 {
//     padding: 16px 48px;
//   }
// }


```


what you learned .tee() stream copys the value while a Readstream can combine a value without copying it.