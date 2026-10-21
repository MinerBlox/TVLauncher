// Full-screen streaming shelf. The first row reuses the five home artworks.
(function () {
  const homeCards = [
    { name:"Apple TV", brand:"appletv", crop:"-9.33vw", aliases:["Apple TV","Apple TV+"] },
    { name:"Arcade", brand:"arcade", crop:"-27.09vw", aliases:["Apple Arcade","Arcade"] },
    { name:"Fitness", brand:"fitness", crop:"-42.94vw", aliases:["Apple Fitness","Fitness+"] },
    { name:"Music", brand:"music", crop:"-58.85vw", aliases:["Apple Music"] },
    { name:"App Store", brand:"appstore", crop:"-74.88vw", aliases:["Content Store","LG Content Store","App Store"] }
  ];
  const services = [
    { name:"Netflix", brand:"netflix", aliases:["netflix"] },
    { name:"Disney+", brand:"disney", asset:"disney.svg", aliases:["disneyplus","disney+"] },
    { name:"Prime Video", brand:"prime", asset:"prime.svg", aliases:["primevideo","amazonprime"] },
    { name:"YouTube", brand:"youtube", aliases:["youtube"] },
    { name:"BBC iPlayer", brand:"iplayer", asset:"iplayer.svg", aliases:["bbciplayer","iplayer"] },
    { name:"ITVX", brand:"itvx", aliases:["itvx","itvhub"] },
    { name:"Channel 4", brand:"channel4", aliases:["channel4","all4"] },
    { name:"Hulu", brand:"hulu", asset:"hulu.svg", aliases:["hulu"] },
    { name:"Paramount+", brand:"paramount", aliases:["paramountplus","paramount+"] },
    { name:"NOW", brand:"now", aliases:["nowtv","now"] },
    { name:"Plex", brand:"plex", aliases:["plex"] },
    { name:"Spotify", brand:"spotify", aliases:["spotify"] },
    { name:"Twitch", brand:"twitch", aliases:["twitch"] },
    { name:"Crunchyroll", brand:"crunchyroll", aliases:["crunchyroll"] },
    { name:"DAZN", brand:"dazn", aliases:["dazn"] }
  ];
  // Real vector brand marks from Simple Icons (https://simpleicons.org), bundled for offline use.
  const brandPaths = {"netflix":["m5.398 0 8.348 23.602c2.346.059 4.856.398 4.856.398L10.113 0H5.398zm8.489 0v9.172l4.715 13.33V0h-4.715zM5.398 1.5V24c1.873-.225 2.81-.312 4.715-.398V14.83L5.398 1.5z"],"youtube":["M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"],"itvx":["M15.91 11.018a59.87 59.87 0 0 0-.98-.27c-.1 0-.16.05-.2.17-.35 1.2-.9 2.53-1.38 3.36-.16-.3-.45-.83-.73-1.3l-1.04-1.83c-.22-.34-.36-.43-.64-.43-.57 0-1.42.51-1.42 1 0 .16.04.28.21.57.2.32.3.6.3.92 0 .82-.62 1.56-1.8 1.56-.55 0-.99-.16-1.27-.45-.27-.28-.4-.65-.4-1.27v-1.03c.2.08.44.12.73.12h.93c.13 0 .17-.05.17-.16v-1c0-.11-.04-.17-.17-.17H6.56v-1.63c0-.2-.05-.33-.16-.43-.16-.15-.5-.22-.89-.22-.4 0-.72.07-.89.22-.1.1-.16.24-.16.43v4c0 .66-.1 1.02-.34 1.27-.2.22-.53.34-.88.34s-.66-.12-.84-.31c-.2-.2-.29-.48-.29-.9v-2.6c0-.11-.04-.16-.16-.16H.18c-.12 0-.17.05-.17.16v2.35c0 .94.25 1.47.67 1.9.55.54 1.48.79 2.38.79.88 0 1.81-.32 2.36-.82a4 4 0 0 0 2.6.82c1.42 0 2.47-.6 3.08-1.6.27.43.47.74.67 1.02.28.42.54.58 1.12.58.54 0 .87-.13 1.17-.59.78-1.18 1.44-2.59 1.92-3.88.05-.16.1-.28.1-.35 0-.08-.05-.14-.17-.18zm-14.85-.92c.66 0 1.07-.46 1.07-1.05 0-.6-.4-1.06-1.07-1.06-.65-.01-1.06.46-1.06 1.05 0 .59.4 1.05 1.06 1.05zm22.84 5.1-2.28-3.13c-.05-.07-.05-.14 0-.2l2.1-3.07c.07-.09.11-.15.11-.28 0-.12-.07-.25-.19-.37a.51.51 0 0 0-.39-.17.4.4 0 0 0-.24.1l-2.9 2.22c-.06.05-.13.05-.2 0l-2.89-2.22a.4.4 0 0 0-.25-.1.51.51 0 0 0-.38.17c-.12.12-.2.25-.2.37 0 .13.05.2.11.28l2.11 3.07c.05.06.05.13 0 .2l-2.28 3.13a.42.42 0 0 0-.1.26c0 .14.06.26.18.38.11.11.24.18.38.18.1 0 .17-.04.26-.1l3.06-2.23a.17.17 0 0 1 .2 0l3.07 2.23c.09.06.16.1.26.1.14 0 .27-.07.38-.18.12-.12.18-.24.18-.38 0-.1-.04-.17-.1-.26z"],"channel4":["m14.309 0-.33.412v4.201l2.382-2.95zm-1.155 1.201L10.707 4.22v8.674h2.447zm3.268 1.701-2.443 3.02v14.81h2.443zM9.887 5.236l-6.201 7.657h3.142L9.887 9.12Zm-6.766 8.48v2.444h10.033v-2.443Zm14.125 0v2.444h3.633v-2.443Zm-6.539 3.268V24h2.443v-7.016Zm-3.271 4.573V24h2.443v-2.443zm6.543 0V24h5.189v-2.443z"],"paramount":["M16.347 21.373c.057-.084.151-.314-.025-.74l-.53-1.428c-.073-.182.084-.293.19-.173 0 0 1.004 1.157 1.264 1.64l.495.822c.425.028 1.6.06 2.732.06a3.26 3.26 0 0 1-.316-.364c-1.93-2.392-3.154-3.724-3.166-3.737-.391-.426-.572-.508-.87-.643a4.82 4.82 0 0 1-.138-.065v.364c0 .047-.057.073-.086.022l-2.846-5.001a1.598 1.598 0 0 0-.508-.587l-.277-.194-1.354 3.123c.212 0 .354.216.27.409l-1.25 2.893h1.147c.443 0 .883.087 1.294.255l.302.125s-.913 1.878-.913 2.867c0 .181.028.362.075.534h2.104l-.096-.595s1.266.294 2.502.413M12 2.437c-6.627 0-12 5.373-12 12 0 2.669.873 5.133 2.346 7.126.503-.218.783-.542.983-.791l2.234-2.858a.467.467 0 0 1 .179-.138l.336-.146 3.674-4.659.534-.417 1.094-1.524a.482.482 0 0 1 .101-.102l.478-.347a.34.34 0 0 1 .398-.004l.578.407c.308.216.557.504.726.84l2.322 4.077c.051.09.09.129.182.174.454.227.732.268 1.33.913.277.304 1.495 1.666 3.203 3.784.236.318.538.588.963.783A11.948 11.948 0 0 0 24 14.437c0-6.627-5.373-12-12-12M3.236 15.1l-.778-.253-.48.662v-.818l-.778-.253.778-.253v-.818l.48.662.778-.253-.48.662Zm-.185 2.676-.252.778-.253-.778h-.818l.661-.481-.253-.777.663.48.66-.48-.252.777.662.481Zm.156-6.195.253.778-.661-.48-.663.48.253-.778-.66-.48h.817l.253-.778.252.777h.818Zm1.314-1.76L4.04 9.16l-.778.253.48-.661-.48-.663.778.254.48-.662v.818l.778.253-.777.252Zm2.045-2.862-.253.777-.252-.777h-.818l.662-.48-.253-.778.661.48.661-.48-.252.777.662.48Zm2.577-1.313-.48.661V5.49l-.779-.254.778-.253v-.817l.48.66.78-.253-.481.663.48.66zm3.265-.75.253.778-.661-.48-.662.48.252-.777-.66-.481h.818L12 3.637l.252.778h.818zm2.93.595v.816l-.481-.661-.777.252.48-.662-.48-.662.777.253.48-.66v.817l.779.252zm5.426 8.285.778.253.48-.662v.818l.778.253-.778.253v.818l-.48-.662-.778.253.48-.662zm-3.077-6.04-.253-.777h-.818l.662-.48-.253-.778.662.48.662-.48-.254.778.662.48h-.818zm1.792 2.086v-.818l-.777-.252.777-.253V7.68l.481.662.777-.254-.48.663.48.66-.777-.252zm1.469 1.278.253-.777.254.777h.816l-.66.481.252.778-.662-.48-.661.48.253-.778-.662-.48zm.506 6.676-.253.778-.253-.778h-.817l.662-.481-.253-.777.66.48.663-.48-.253.777.661.481zm-12.08-.615.76-1.588c.024-.048-.032-.108-.067-.067l-.664.668c-.313.329-.847 1.25-.95 1.421l-.808 1.335a.109.109 0 0 1 .1.162l-.739 1.238c-.18.309.145.523.189.452 1.157-1.868 1.832-1.719 1.832-1.719l.387-.897c.022-.047-.001-.1-.05-.12-.12-.05-.316-.27.01-.885z"],"now":["M8.8009 11.9974c0-.974.7878-1.7634 1.7596-1.7634.9718 0 1.7596.7895 1.7596 1.7634 0 .9738-.7878 1.7634-1.7596 1.7634-.9718 0-1.7596-.7896-1.7596-1.7634zm13.0277-2.896l-1.2166 2.4524-.7878-2.3188-.0015-.0003c-.1566-.4505-.5822-.7737-1.0829-.7737-.399 0-.7505.2054-.956.517-.5255.8015-1.0497 1.6094-1.5735 2.414l-.2785-1.956c-.0963-.6296-.6807-1.0587-1.3048-.9624-.6249.096-1.0538.6778-.958 1.304l.0488.328c-.6427-1.0749-1.8162-1.7945-3.1575-1.7945-1.353 0-2.5352.7324-3.174 1.823l.07-.3434c.1223-.6008-.2645-1.1873-.864-1.31-.5993-.1223-1.1848.265-1.307.8659l-.4763 2.3382-1.752-2.7177c-.198-.3042-.5399-.5053-.9284-.5053-.5317 0-.976.3765-1.084.879l-1.0217 5.012c-.1223.6007.257 1.1846.8575 1.3121.0747.0159.1556.0235.2291.024.5139.0036.9763-.3579 1.0844-.892l.4763-2.3383c.5924.9217 1.1845 1.844 1.779 2.7641.196.2777.5281.4662.9018.4662.5462 0 1.0002-.398 1.0915-.9219l.469-2.302c.2292 1.815 1.7755 3.2187 3.6488 3.2187 1.7257 0 3.1736-1.191 3.5705-2.7972l.2613 1.759c.0736.579.5474 1.0371 1.1411 1.0371.4272 0 .7756-.2445.9972-.5841l1.8844-2.8942.905 2.6645c.1622.4752.5808.8138 1.0961.8138.4788 0 .855-.288 1.0609-.7155l2.402-4.845c.2834-.568.0528-1.2551-.5123-1.5403-.5647-.285-1.2558-.0524-1.5379.5196Z"],"plex":["M3.987 8.409c-.96 0-1.587.28-2.12.933v-.72H0v8.88s.038.018.127.037c.138.03.821.187 1.331-.249.441-.377.542-.814.542-1.318v-1.283c.533.573 1.147.813 2 .813 1.84 0 3.253-1.493 3.253-3.48 0-2.12-1.36-3.613-3.266-3.613Zm16.748 5.595.406.591c.391.614.894.906 1.492.908.621-.012 1.064-.562 1.226-.755 0 0-.307-.27-.686-.72-.517-.614-1.214-1.755-1.24-1.803l-1.198 1.779Zm-3.205-1.955c0-2.08-1.52-3.64-3.52-3.64s-3.467 1.587-3.467 3.573a3.48 3.48 0 0 0 3.507 3.52c1.413 0 2.626-.84 3.253-2.293h-2.04l-.093.093c-.427.4-.72.533-1.227.533-.787 0-1.373-.506-1.453-1.266h4.986c.04-.214.054-.307.054-.52Zm-7.671-.219c0 .769.11 1.701.868 2.722l.056.069c-.306.526-.742.88-1.248.88-.399 0-.814-.211-1.138-.579a2.177 2.177 0 0 1-.538-1.441V6.409H9.86l-.001 5.421Zm9.283 3.46h-2.39l2.247-3.332-2.247-3.335h2.39l2.248 3.335-2.248 3.332Zm1.593-1.286Zm-17.162-.342c-.933 0-1.68-.773-1.68-1.72s.76-1.666 1.68-1.666c.92 0 1.68.733 1.68 1.68 0 .946-.733 1.706-1.68 1.706Zm18.361-1.974L24 8.622h-2.391l-.87 1.293 1.195 1.773Zm-9.404-.466c.16-.706.72-1.133 1.493-1.133.773 0 1.373.467 1.507 1.133h-3Z"],"spotify":["M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"],"twitch":["M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"],"crunchyroll":["M2.909 13.436C2.914 7.61 7.642 2.893 13.468 2.898c5.576.005 10.137 4.339 10.51 9.819q.021-.351.022-.706C24.007 5.385 18.64.006 12.012 0S.007 5.36 0 11.988 5.36 23.994 11.988 24q.412 0 .815-.027c-5.526-.338-9.9-4.928-9.894-10.538Zm16.284.155a4.1 4.1 0 0 1-4.095-4.103 4.1 4.1 0 0 1 2.712-3.855 8.95 8.95 0 0 0-4.187-1.037 9.007 9.007 0 1 0 8.997 9.016q-.001-.847-.15-1.651a4.1 4.1 0 0 1-3.278 1.63Z"],"rakuten":["M23.277 21.3L3.939 24 .722 21.3h22.555zM7.6 19.276H3.939V0h6.052a6.653 6.653 0 0 1 6.65 6.646c0 2.234-1.108 4.204-2.799 5.418l5.418 7.211h-4.585l-4.486-5.979H7.6v5.98zm0-9.64h2.392a2.992 2.992 0 0 0 2.989-2.989 2.994 2.994 0 0 0-2.989-2.986H7.6v5.975z"],"dazn":["M14.774 8.291l.772-2.596.79 2.596zm3.848 2.268l-2.025-6.128c-.045-.135-.097-.224-.154-.266-.059-.041-.152-.063-.28-.063h-1.12a.485.485 0 0 0-.284.068c-.06.045-.11.132-.149.261l-2.045 6.128c-.025.032-.038.096-.038.192 0 .149.09.223.27.223h.84c.076 0 .139-.003.187-.01a.207.207 0 0 0 .116-.048.326.326 0 0 0 .077-.116c.022-.051.046-.119.072-.202l.318-1.071h2.306l.327 1.051c.026.09.051.16.077.213a.395.395 0 0 0 .087.12c.031.028.07.047.114.053h.002c.045.006.103.01.173.01h.897c.18 0 .27-.074.27-.223a.59.59 0 0 0-.005-.09.878.878 0 0 0-.036-.108l.003.006zm-.994 2.467h-.646c-.168 0-.279.024-.333.072-.055.049-.082.147-.082.295v3.638l-1.91-3.647c-.076-.155-.152-.253-.226-.295-.074-.041-.204-.063-.39-.063h-.599c-.167 0-.278.025-.332.073-.055.048-.082.147-.082.294v6.138c0 .148.025.246.077.294.052.048.16.072.328.072h.656c.167 0 .278-.024.332-.072.055-.048.082-.146.082-.294v-3.648l1.91 3.657c.077.155.152.253.227.295.073.042.204.062.39.062h.598c.167 0 .278-.024.333-.072.054-.048.082-.146.082-.294v-6.138c0-.148-.028-.246-.082-.294-.055-.048-.166-.073-.333-.073zm3.203-.581l1.665 1.665v8.385H1.505V14.11l1.663-1.664a.63.63 0 0 0 0-.89L1.504 9.891V1.505h20.991v8.384l-1.665 1.666a.63.63 0 0 0 0 .89zM24 0H0v10.613L1.387 12 0 13.387V24h24V13.387L22.613 12 24 10.613zM10.67 18.469H7.96l2.855-4.014a.67.67 0 0 0 .087-.155.425.425 0 0 0 .019-.135v-.772c0-.148-.028-.246-.082-.294-.055-.048-.166-.073-.334-.073H6.382c-.149 0-.245.028-.29.082-.045.055-.068.169-.068.343v.58c0 .172.023.287.068.341.045.055.141.083.29.083h2.545L6.11 18.469a.438.438 0 0 0-.107.27v.792c0 .148.027.245.082.294.055.048.167.072.334.072h4.25c.148 0 .245-.027.29-.081.045-.055.068-.17.068-.344v-.579c0-.173-.023-.287-.068-.342-.045-.055-.142-.082-.29-.082zM9.408 8.233c0 .264-.017.484-.052.661-.036.177-.093.32-.174.43a.648.648 0 0 1-.318.231 1.523 1.523 0 0 1-.487.068h-.79v-4.17h.79c.366 0 .63.11.79.324.16.215.241.571.241 1.067v1.389zm1.38-2.789c-.225-.457-.533-.795-.921-1.013-.39-.219-.88-.328-1.47-.328H6.418c-.167 0-.278.024-.333.072-.054.049-.082.147-.082.294v6.138c0 .148.028.246.082.295.055.048.166.072.333.072h2.218c1.048 0 1.765-.447 2.15-1.342.09-.205.153-.413.188-.622a4.91 4.91 0 0 0 .054-.796V6.911c0-.367-.018-.656-.054-.868a2.2 2.2 0 0 0-.193-.612l.006.013z"],"mubi":["M3.357.033A3.357 3.357 0 0 0 0 3.39a3.357 3.357 0 0 0 3.357 3.357A3.357 3.357 0 0 0 6.713 3.39 3.357 3.357 0 0 0 3.357.033Zm8.643 0A3.357 3.357 0 0 0 8.645 3.39 3.357 3.357 0 0 0 12 6.746a3.357 3.357 0 0 0 3.357-3.357A3.357 3.357 0 0 0 12 .033Zm-8.643 8.61A3.357 3.357 0 0 0 0 12a3.357 3.357 0 0 0 3.357 3.355A3.357 3.357 0 0 0 6.713 12a3.357 3.357 0 0 0-3.356-3.357Zm8.643 0A3.357 3.357 0 0 0 8.645 12 3.357 3.357 0 0 0 12 15.355 3.357 3.357 0 0 0 15.357 12 3.357 3.357 0 0 0 12 8.643zm8.643 0A3.357 3.357 0 0 0 17.287 12a3.357 3.357 0 0 0 3.356 3.355A3.357 3.357 0 0 0 24 12a3.357 3.357 0 0 0-3.357-3.357Zm-17.286 8.61A3.357 3.357 0 0 0 0 20.612a3.357 3.357 0 0 0 3.357 3.356 3.357 3.357 0 0 0 3.356-3.356 3.357 3.357 0 0 0-3.356-3.357Zm8.643 0a3.357 3.357 0 0 0-3.355 3.358A3.357 3.357 0 0 0 12 23.967a3.357 3.357 0 0 0 3.357-3.356A3.357 3.357 0 0 0 12 17.254z"]};
  const layer = document.createElement("section");
  layer.id = "servicegrid";
  layer.setAttribute("aria-label", "Streaming apps");
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = '<button class="servicegrid-back" type="button" aria-label="Return to home"><svg viewBox="0 0 40 20" aria-hidden="true"><path d="M3 17 20 5l17 12"/></svg></button><div class="servicegrid-list"></div><div class="servicegrid-toast" role="status" aria-live="polite"></div>';
  document.body.appendChild(layer);
  const list = layer.querySelector(".servicegrid-list");
  const toast = layer.querySelector(".servicegrid-toast");
  let previousFocus = null;
  let toastTimer = null;
  function normalized(value) { return String(value || "").toLocaleLowerCase().replace(/[^a-z0-9+]/g, ""); }
  function findInstalled(service) {
    if (typeof applist === "undefined" || !Array.isArray(applist)) return null;
    return applist.find(function (app) {
      const name = normalized(app.title);
      const display = normalized(typeof appdisplayname === "function" ? appdisplayname(app) : app.title);
      const id = normalized(app.id);
      return service.aliases.some(function (alias) {
        const target = normalized(alias);
        return target.length < 5 ? name === target || display === target :
          name.indexOf(target) !== -1 || display.indexOf(target) !== -1 || id.indexOf(target) !== -1;
      });
    }) || null;
  }
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("visible"); }, 3000);
  }
  homeCards.concat(services).forEach(function (item, index) {
    const homeCard = index < 5;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "service-card" + (homeCard ? " home-card" : "");
    button.dataset.brand = item.brand;
    button.dataset.index = index;
    button.style.setProperty("--row-offset", (Math.floor(index / 5) * 18.65) + "vh");
    button.setAttribute("aria-label", item.name);
    const artwork = document.createElement("span");
    artwork.className = "service-artwork";
    if (homeCard) {
      artwork.style.setProperty("--crop-x", item.crop);
    } else if (item.asset) {
      const logo = document.createElement("img");
      logo.className = "service-logo";
      logo.src = "access/services/" + item.asset;
      logo.alt = "";
      logo.draggable = false;
      artwork.appendChild(logo);
    } else if (brandPaths[item.brand]) {
      const logo = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      logo.setAttribute("viewBox", "0 0 24 24");
      logo.setAttribute("aria-hidden", "true");
      brandPaths[item.brand].forEach(function (shape) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", shape);
        logo.appendChild(path);
      });
      artwork.appendChild(logo);
    }
    button.appendChild(artwork);
    button.addEventListener("click", function () {
      const app = findInstalled(item);
      if (!app) { showToast(item.name + " was not found in this launcher\u0027s app list"); return; }
      if (typeof recordrecent === "function") recordrecent(app.id);
      if (typeof launchapp === "function") launchapp(app.id);
    });
    list.appendChild(button);
  });
  window.activateHomeCard = function (index) {
    const item = homeCards[index];
    if (!item) return;
    const app = findInstalled(item);
    if (app) {
      if (typeof recordrecent === "function") recordrecent(app.id);
      if (typeof launchapp === "function") launchapp(app.id);
      return;
    }
    openServiceGrid();
    if (typeof setfocus === "function") setfocus(list.children[index]);
    showToast(item.name + " was not found in this launcher\u0027s app list");
  };
  window.serviceGridIsOpen = function () { return layer.classList.contains("open"); };
  window.serviceGridAtTopRow = function () {
    const focused = typeof dpadfocus !== "undefined" ? dpadfocus : null;
    return !focused || !list.contains(focused) || Number(focused.dataset.index) < 5;
  };
  window.openServiceGrid = function () {
    if (serviceGridIsOpen()) return;
    previousFocus = typeof dpadfocus !== "undefined" ? dpadfocus : null;
    layer.classList.add("open");
    layer.setAttribute("aria-hidden", "false");
    document.body.classList.add("services-open");
    if (typeof keyboardmode !== "undefined") keyboardmode = true;
    if (typeof setfocus === "function") setfocus(list.firstElementChild);
  };
  window.closeServiceGrid = function () {
    if (!serviceGridIsOpen()) return;
    layer.classList.remove("open");
    layer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("services-open");
    toast.classList.remove("visible");
    if (typeof setfocus === "function") {
      setfocus(previousFocus && document.body.contains(previousFocus) ? previousFocus : document.querySelector("#featurecards .featuretile"));
    }
  };
  layer.querySelector(".servicegrid-back").addEventListener("click", closeServiceGrid);
})();
