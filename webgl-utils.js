export async function setupWebGL(gl, { vertexURL, fragmentURL, attribs, stride }) {
    // Compile shader from URL
    async function compileShader(type, url) {
        const response = await fetch(url);
        const source = await response.text();
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            throw new Error('Shader compilation failed');
        }
        return shader;
    }

    // Create program and link shaders
    const program = gl.createProgram();
    const [vertShader, fragShader] = await Promise.all([
        compileShader(gl.VERTEX_SHADER, vertexURL),
        compileShader(gl.FRAGMENT_SHADER, fragmentURL)
    ]);
    
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        throw new Error('Program linking failed');
    }

    // Set up vertex attributes
    Object.entries(attribs).forEach(([name, index]) => {
        gl.bindAttribLocation(program, index, name);
        gl.enableVertexAttribArray(index);
        gl.vertexAttribPointer(index, 2, gl.FLOAT, false, stride, 0);
    });

    return program;
}

export function getShader(gl, id) {
    const script = document.getElementById(id);
    if (!script) return null;
    
    let shader;
    if (script.type === 'x-shader/x-vertex') {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (script.type === 'x-shader/x-fragment') {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, script.text);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}