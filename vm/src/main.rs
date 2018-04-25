extern crate blintz_vm;

use blintz_vm::chunk::{new_chunk, write_chunk};

fn main() {
    let mut chunk = new_chunk();
    write_chunk(&mut chunk, 0);
}
