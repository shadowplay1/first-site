function calculateQuadraticEquation(a = 1, b = 0, c = 0) {
    const ratios = {
        a: String(a).replace('+', ''),
        b: String(b).replace('-', ''),
        c: String(c).replace('-', '')
    }

    let equation = `${ratios.a == '1' ? '' : ratios.a}x^2 ${String(b) >= 0 ? '+' : '-'} ${ratios.b}x ${String(c) >= 0 ? '+' : '-'} ${ratios.c} = 0`
    let d = b ** 2 - 4 * a * c

    if (d < 0) return { 
        x1: null, 
        x2: null, 
        d,
        
        input: {
            a, 
            b, 
            c 
        },

        equation 
    }

    if (d == 0) return { 
        x1: -b / (2 * a), 
        x2: null, 
        d,

        input: {
            a, 
            b, 
            c 
        },

        equation 
    }

    else return { 
        x1: (-b + Math.sqrt(d)) / (2 * a), 
        x2: (-b - Math.sqrt(d)) / (2 * a), 
        d, 
        sqrtD: Math.sqrt(d),

        input: { 
            a, 
            b, 
            c 
        },

        equation 
    }
}