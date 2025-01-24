// Fragment shader: Procedural tunnel with mouse interaction
precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_mouse;

// From https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898,4.1414))) * 43758.5453);
}

void main() {
    vec2 uv = v_uv * 2.0 - 1.0;
    vec2 mouse = u_mouse * 2.0 - 1.0;
    
    // Create polar coordinates
    float angle = atan(uv.y, uv.x);
    float radius = length(uv) * 4.0;
    
    // Animate with time and mouse
    float pattern = sin(radius * 10.0 + u_time) 
                  * cos(angle * 5.0 + u_time * 2.0)
                  * mix(0.5, 1.5, length(mouse));
    
    // Generate trippy colors
    vec3 color = 0.5 + 0.5*cos(u_time+uv.xyx+vec3(0,2,4));
    color *= pattern * (1.0 - radius * 0.2);
    
    gl_FragColor = vec4(color, 1.0);
}