export default function ManyToManyMap() {
    const values = new Set();
    //const map = new class extends Map {};
    const map = new Map();

    Object.defineProperties(
        map,
        {
            [Symbol.toStringTag]: { 
                value: ManyToManyMap.name,
                configurable: true 
            },
        }
    )

    return Object.assign(
        map, 
        {
            add (key, value) {
                values.add(value),
                //[].concat(key).forEach(
                //    key => {
                        map.has(key) ?
                            map.get(key).add(value) :
                            map.set(key, new Set().add(value));
                //    }
                //);
                return this;
            },
            getAll () { 
                return values; 
            },
            mergeWith (mtmm = ManyToManyMap()) {
                mtmm.forEach((value, key) => this.add(key, value));
                return this;
            },
            forEach (cbfunction = (value, key, values) => {}) {
                for (let {0:key, 1:set} of map) {
                    for (let value of set) {
                        cbfunction(value, key, map);
                    }
                } 
            },
            map (cbfunction = (value, key, values) => {}) {
                const mtmm = ManyToManyMap();
                this.forEach(
                    (value, key, values) => mtmm.add(
                        key, cbfunction(value, key, values)
                    )
                );
                return mtmm;
            },
        }
    );
};