import React from "react";
import "./Slider.css";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

function Slider() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <section className="deals">
      <div className="container1">
        <div className="left-section">
          <h2 className="text-[22px] font-600">Popular Products</h2>
          <p className="text-[14px] font-400">
            Do not miss the current offers until it ends..
          </p>
        </div>
        <div className="right-section">
          <Box
            sx={{
              maxWidth: { xs: 320, sm: 480 },
              bgcolor: "background.paper",
            }}
          >
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="scrollable auto tabs example"
            >
              <Tab
                label="Grocerys"
                onClick={() => {
                  const targetElement = document.querySelector(".grocery-categories");
                  if (targetElement) {
                    const offset = 100; // Adjust as needed
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

                    window.scrollTo({
                      top: targetPosition,
                      behavior: "smooth",
                    });
                  }
                }}
              />
              <Tab
                label="Electronics"
                onClick={() => {
                  const targetElement = document.querySelector(".electronics-categories");
                  if (targetElement) {
                    const offset = 100; // Adjust as needed
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

                    window.scrollTo({
                      top: targetPosition,
                      behavior: "smooth",
                    });
                  }
                }}
              />
              <Tab
                label="Home lifestyles"
                onClick={() => {
                  const targetElement = document.querySelector(".homelifestyles-categories");
                  if (targetElement) {
                    const offset = 100; // Adjust as needed
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

                    window.scrollTo({
                      top: targetPosition,
                      behavior: "smooth",
                    });
                  }
                }}
              />

            </Tabs>
          </Box>
        </div>
      </div>
    </section>

  );
}

export default Slider;
