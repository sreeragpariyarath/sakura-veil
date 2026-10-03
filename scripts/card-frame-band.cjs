// Inserts a clean 8 px stretch band into the card frame art so CSS border-image can grow the card for long text
// without smearing the side decorations (tassels, buds, cloud pattern).
// Usage (trimmed 1400 px wide PNG in, WebP out):
//   node scripts/card-frame-band.cjs card-base.png static/images/ui/card-frame.webp 357 357 300 300 78 1330 200 1150
// Args: Y (insert row), LEFT_ROW / RIGHT_ROW (rows whose borders are plain), PAPER_ROW, LEFT_END / RIGHT_START
// (border column limits), INNER_FROM / INNER_TO (clean paper columns to average for the band's paper).
const sharp = require('sharp')
const [src, dst, Y, LEFT_ROW, RIGHT_ROW, PAPER_ROW, LEFT_END, RIGHT_START, INNER_FROM, INNER_TO] = process.argv.slice(2).map((v, i) => i < 2 ? v : +v)
;(async () => {
    const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const W = info.width, H = info.height, C = 4, BAND = 8
    const row = (y) => data.subarray(y * W * C, (y + 1) * W * C)
    const band = Buffer.alloc(W * C)
    const L = row(LEFT_ROW), R = row(RIGHT_ROW), P = row(PAPER_ROW)
    // Paper: heavy horizontal box blur of the paper row to remove petals and cloud details
    const radius = 60
    for(let x = 0; x < W; x++)
    {
        let src
        if(x < LEFT_END) src = L.subarray(x * C, x * C + C)
        else if(x >= RIGHT_START) src = R.subarray(x * C, x * C + C)
        else
        {
            const acc = [0, 0, 0, 0]; let n = 0
            // Sample only the clean paper interior (the paper next to the borders has pink shading)
            const cx = Math.min(Math.max(x, INNER_FROM + radius), INNER_TO - radius)
            for(let k = cx - radius; k <= cx + radius; k++) { for(let c = 0; c < 4; c++) acc[c] += P[k * C + c]; n++ }
            src = Buffer.from(acc.map(v => Math.round(v / n)))
        }
        src.copy(band, x * C)
    }
    const out = Buffer.alloc(W * (H + BAND) * C)
    data.copy(out, 0, 0, Y * W * C)
    for(let i = 0; i < BAND; i++) band.copy(out, (Y + i) * W * C)
    data.copy(out, (Y + BAND) * W * C, Y * W * C)
    await sharp(out, { raw: { width: W, height: H + BAND, channels: 4 } }).webp({ quality: 88, alphaQuality: 90 }).toFile(dst)
    console.log('done', W, H + BAND)
})()
