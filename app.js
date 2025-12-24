document.addEventListener("DOMContentLoaded", () => {

  const $ = id => document.getElementById(id);

  let notes = JSON.parse(localStorage.getItem("notes") || "[]");
  let editIndex = null;
  let selectedColor = "yellow";
  let view = "notes";

  function openEditor(i=null){
    editIndex=i;
    if(i!==null){
      const n=notes[i];
      $("text").value=n.text;
      selectedColor=n.color||"yellow";
      $("archive").textContent=n.archived?"Restore":"Archive";
      $("archive").style.display="inline-block";
      $("delete").style.display="inline-block";
    }else{
      $("text").value="";
      selectedColor="yellow";
      $("archive").style.display="none";
      $("delete").style.display="none";
    }
    $("editor").style.display="flex";
  }

  $("add").onclick=()=>openEditor();
  $("cancel").onclick=()=>{ $("editor").style.display="none"; editIndex=null; };

  $("save").onclick=()=>{
    const t=$("text").value.trim();
    if(!t)return;
    if(editIndex!==null){
      Object.assign(notes[editIndex],{
        text:t,color:selectedColor,time:new Date().toLocaleString()
      });
    }else{
      notes.unshift({
        text:t,color:selectedColor,
        time:new Date().toLocaleString(),
        archived:false
      });
    }
    localStorage.notes=JSON.stringify(notes);
    $("editor").style.display="none";
    editIndex=null;
    render();
  };

  $("delete").onclick=()=>{
    if(editIndex===null)return;
    if(confirm("Delete this note?")){
      notes.splice(editIndex,1);
      localStorage.notes=JSON.stringify(notes);
      $("editor").style.display="none";
      editIndex=null;
      render();
    }
  };

  $("archive").onclick=()=>{
    if(editIndex===null)return;
    notes[editIndex].archived=!notes[editIndex].archived;
    localStorage.notes=JSON.stringify(notes);
    $("editor").style.display="none";
    editIndex=null;
    render();
  };

  document.querySelectorAll(".colors button").forEach(b=>{
    b.onclick=()=>selectedColor=b.dataset.color;
  });

  $("search").oninput=render;
  $("tabNotes").onclick=()=>{view="notes";render();};
  $("tabArchive").onclick=()=>{view="archive";render();};

  /* EXPORT */
  $("export").onclick=()=>{
    const data=JSON.stringify(notes,null,2);
    const blob=new Blob([data],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="little-notes-backup.json";
    a.click();
  };

  /* IMPORT */
  $("import").onclick=()=>$("fileInput").click();
  $("fileInput").onchange=e=>{
    const f=e.target.files[0];
    if(!f)return;
    const r=new FileReader();
    r.onload=()=>{
      try{
        const data=JSON.parse(r.result);
        if(Array.isArray(data)){
          notes=data;
          localStorage.notes=JSON.stringify(notes);
          render();
          alert("Import success");
        }else alert("Invalid file");
      }catch{ alert("Invalid JSON"); }
    };
    r.readAsText(f);
  };

  function render(){
    const q=$("search").value.toLowerCase();
    $("list").innerHTML="";
    notes.forEach((n,i)=>{
      if(view==="notes"&&n.archived)return;
      if(view==="archive"&&!n.archived)return;
      if(!n.text.toLowerCase().includes(q))return;
      const d=document.createElement("div");
      d.className=`note ${n.color||"yellow"}`;
      d.onclick=()=>openEditor(i);
      d.innerHTML=`<b>${n.text.split("\n")[0]}</b><small>${n.time}</small>`;
      $("list").appendChild(d);
    });
  }

  render();
});