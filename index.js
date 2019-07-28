const fs = require('fs');

fs.readFile(__dirname + '/SynthDefPool/pool/acid_oto309.scd', (err, data) => {
    const synthDef = data.toString();

    const final = {
        name: '',
        uGens: {
            ar: [],
            kr: []
        },
        variants: [],
        metaData: {}
    }

    const nameRegex = /SynthDef\([\\|"|'](.\w+)/gm
    final.name = nameRegex.exec(synthDef)[1];

    const arRegex = /(([A-Z]\w+)(?=\.ar))/g
    const krRegex = /(([A-Z]\w+)(?=\.kr))/g

    let ars;
    do {
        ars = arRegex.exec(synthDef);
        if (ars) {
            final.uGens.ar.push(ars[1])
        }
    } while (ars);

    let krs;
    do {
        krs = krRegex.exec(synthDef);
        if (krs) {
            final.uGens.kr.push(krs[1])
        }
    } while (krs);


    const variantsRegex = /(?:variants:)\s(.*?)\s(?=\))/gm
    let rawVariants = variantsRegex.exec(synthDef);
    if (rawVariants) {
        rawVariants = rawVariants[1]

        const variantNameRegex = /(?:\w+)(?=: \[)/g;

        final.variants = [];

        let variantNames;
        do {
            variantNames = variantNameRegex.exec(rawVariants);
            if (variantNames) {
                final.variants.push({
                    name: variantNames[0]
                })
            }
        } while (variantNames);

        const variantAttributesRegex = /\[(.*?)\]/g

        let variantAttributes;
        let variantCount = 0
        do {
            variantAttributes = variantAttributesRegex.exec(rawVariants);
            if (variantAttributes) {
                final.variants[variantCount].attributes = variantAttributes[1]
                        .split(",")
                        .map(str => str.trim().split(":"))
                        .map(pair => ({ [pair[0]]: pair[1].trim() }))

                variantCount++;
            }
        } while (variantAttributes);
    }

    const metaDataRegex = /(?<=metadata: \(\n).*(?=\))/gms
    let rawmetaData = metaDataRegex.exec(synthDef)[0];

    // TODO remove last ) in last regex
    const metaDataStrippingRegex = /\r?\t|\)|\r/g
    const metaDataStipped = rawmetaData.replace(metaDataStrippingRegex, "")

    const metaDataArray = metaDataStipped
            .split(',\n')
            .filter(e => e.length > 0)
            .map(e => e.split(":"))
            .map(pair => ({ [pair[0]]: pair[1].replace(/\r?\t|\n|\r/g, "").trim() }))

    const metaDataObject = {};

    metaDataArray.forEach((obj,i) => {
        const key = Object.keys(obj)[0]
        metaDataObject[key] = metaDataArray[i][key]
    })

    if (metaDataObject.tags) {
        const rawTags = metaDataObject.tags;
        const rawTagsStrippingRegex = /\r?\\|\[|\]|/g
        const rawTagsStripped = rawTags.replace(rawTagsStrippingRegex, "")
        const tagArray = rawTagsStripped.split(",").map(e => e.trim())

        metaDataObject.tags = tagArray
    }

    final.metaData = metaDataObject

    console.log(final)
});
