async function obtenArtistaFijo(){
    const URL= "https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb";

    const args ={
        method: "GET",
        headers: {
            Authorization: "Bearer BQCkauR7DsMCI41dSmYEx7sOgZJFrBGaDHYV-iAUAPjnzZuKaU_JzLfny8fU5PsCNuABQP3xR-ca_3bnA-bcpmGacMLcTovOcyuUtSrnyjuFBiYVCB_RfTL5zEh0x_d-c1G517dkefA",
        }
    };

    const response = await fetch(URL, args);
    const data = await response.json();
    console.log(response);
}