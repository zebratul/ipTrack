export async function googleDNS(adress) {
    try {
        const response = await fetch(`https://dns.google/resolve?name=${adress}`, {
            method: 'GET', 
            });
        const resolve = await response.json();
        if (!response.ok) {
            throw new Error (`Error: ${response.status}`);
          }
        let resolvedIp = resolve.Answer[0].data;
        let status = response.ok;
        return { status, resolvedIp };
    } catch (err) {
        console.log(err);
        let status = false;
        return { status };
    }
};