const r={width:1280,label:"PC"},s=[{title:"지도",items:[{id:"01",name:"지도",file:"map.html",ready:!0},{id:"g1",name:"MAP 스크립트 가이드",file:"guide-map.html",ready:!0}]},{title:"내부망",items:[{id:"601",name:"01 기본정보",file:"inter-SFR-006-01-01.html",ready:!0},{id:"602",name:"02 매립면허",file:"inter-SFR-006-01-02.html",ready:!0},{id:"603",name:"03 점용사용허가",file:"inter-SFR-006-01-03.html",ready:!0},{id:"604",name:"04 적합성협의",file:"inter-SFR-006-01-04.html",ready:!0},{id:"605",name:"05 어업면허",file:"inter-SFR-006-01-05.html",ready:!0},{id:"606",name:"06 이용·개발사업",file:"inter-SFR-006-01-06.html",ready:!0},{id:"607",name:"07 지역위원회",file:"inter-SFR-006-01-07.html",ready:!0},{id:"608",name:"08 지역협의회",file:"inter-SFR-006-01-08.html",ready:!0},{id:"609",name:"09 지역역량강화",file:"inter-SFR-006-01-09.html",ready:!0},{id:"610",name:"10 해양용도구역",file:"inter-SFR-006-01-10.html",ready:!0},{id:"620",name:"이행점검 현황",file:"inter-SFR-006-02.html",ready:!0},{id:"630",name:"이행점검 상세",file:"inter-SFR-006-03.html",ready:!0},{id:"640",name:"결과 목록",file:"inter-SFR-006-04.html",ready:!0},{id:"641",name:"결과 01 기초지자체",file:"inter-SFR-006-04-01.html",ready:!0},{id:"642",name:"결과 02 시도검토",file:"inter-SFR-006-04-02.html",ready:!0},{id:"643",name:"결과 03 해수부1차",file:"inter-SFR-006-04-03.html",ready:!0},{id:"644",name:"결과 04 전문기관",file:"inter-SFR-006-04-04.html",ready:!0},{id:"645",name:"결과 05 최종승인",file:"inter-SFR-006-04-05.html",ready:!0}]}],m=document.getElementById("viewerNav"),l=document.getElementById("viewerIframe"),o=document.getElementById("viewerFrame"),f=document.getElementById("viewerSizeLabel"),h=document.getElementById("viewerPageCount"),v=document.getElementById("viewerOpenTab");let i="map.html";function c(){return s.flatMap(e=>e.items.filter(t=>t.ready&&t.file))}function u(){const e=c().length;h.textContent=`${e}개 화면`,m.innerHTML=s.map(t=>{const a=t.items.map(n=>!n.ready||!n.file?`
          <li class="viewer-nav__item viewer-nav__item--pending">
            <span class="viewer-nav__id">${n.id}</span>
            <span class="viewer-nav__name">${n.name}</span>
            <span class="viewer-nav__badge">대기</span>
          </li>`:`
        <li>
          <button
            type="button"
            class="viewer-nav__btn${n.file===i?" viewer-nav__btn--active":""}"
            data-file="${n.file}"
          >
            <span class="viewer-nav__id">${n.id}</span>
            <span class="viewer-nav__name">${n.name}</span>
          </button>
        </li>`).join("");return`
      <section class="viewer-nav__group">
        <h2>${t.title}</h2>
        <ul>${a}</ul>
      </section>`}).join("")}function y(e){i=e,l.src=`./${e}`,u(),history.replaceState(null,"",`#${encodeURIComponent(e)}`)}function d(){const e=Math.round(o.getBoundingClientRect().height);f.textContent=`${r.label} · ${r.width} × ${e||"—"}`}function p(){const e=decodeURIComponent(window.location.hash.replace("#",""));if(!e)return;c().some(a=>a.file===e)&&(i=e)}m.addEventListener("click",e=>{const t=e.target.closest(".viewer-nav__btn");t&&y(t.dataset.file)});v.addEventListener("click",()=>{window.open(`./${i}`,"_blank")});l.addEventListener("load",d);window.addEventListener("resize",d);p();u();l.src=`./${i}`;o.style.setProperty("--frame-width",`${r.width}px`);d();
