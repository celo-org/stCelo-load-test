//SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.0;

library LinkedLibrary3 {
  struct Struct {
    uint256 field;
  }

  function get(Struct storage s) public view returns (uint256) {
    return s.field;
  }

  function increase(Struct storage s) public {
    if (s.field == 0) {
      s.field = 1;
    }
    s.field *= 3;
  }
}
