// Vertex shader for waveform rendering
@vertex
fn vertex_main(
    @builtin(vertex_index) vertex_index : u32,
    @builtin(instance_index) instance_index : u32,
) -> @builtin(position) vec4<f32> {
    let vertices = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>( 1.0,  1.0),
        vec2<f32>(-1.0,  1.0),
    );
    
    return vec4<f32>(vertices[vertex_index], 0.0, 1.0);
}

// Fragment shader for waveform rendering
@fragment
fn fragment_main(
    @builtin(position) position: vec4<f32>,
) -> @location(0) vec4<f32> {
    let x = position.x;
    let y = position.y;
    
    // Simple gradient background
    let bg = mix(
        vec3<f32>(0.1, 0.1, 0.15),
        vec3<f32>(0.15, 0.15, 0.2),
        y / 720.0
    );
    
    return vec4<f32>(bg, 1.0);
}

// Waveform line vertex shader
@vertex
fn waveform_vertex(
    @builtin(vertex_index) vertex_index: u32,
) -> @builtin(position) vec4<f32> {
    // Will be fed by compute shader or buffer
    return vec4<f32>(0.0, 0.0, 0.0, 1.0);
}

// Waveform line fragment shader
@fragment
fn waveform_fragment(
    @builtin(position) position: vec4<f32>,
) -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 1.0, 1.0, 1.0);
}
