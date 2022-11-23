//SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.0;

import "./LinkedLibrary3.sol";

library LinkedLibrary2 {
  using LinkedLibrary3 for LinkedLibrary3.Struct;

  struct Struct {
    LinkedLibrary3.Struct s;
  }

  function get(Struct storage s) public view returns (uint256) {
    return s.s.get();
  }

  function increase(Struct storage s) public {
    s.s.increase();
  }
}
