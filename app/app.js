import { forceSimulation, select, forceLink, forceManyBody, forceCenter, drag } from "d3";
import { v4 as uuid } from "uuid";
import "./styles.scss";

const selectedPages = new Set();

const createNode = (name) => ({
  id: uuid(),
  name,
  children: [],
});

const rootPage = createNode("root");
const googlePage = createNode("https://www.google.com");
const paypalPage = createNode("https://www.paypal.com");
const netflixPage = createNode("https://www.netflix.com");
const dropboxPage = createNode("https://www.dropbox.com");
const targetPage = createNode("https://www.target.com");
const amazonPage = createNode("https://www.amazon.com");
const applePage = createNode("https://www.apple.com");
const bestBuyPage = createNode("https://www.bestbuy.com");
const ebayPage = createNode("https://www.ebay.com");
const redditPage = createNode("https://www.reddit.com");

rootPage.children.push(
  googlePage,
  paypalPage,
  netflixPage,
  dropboxPage,
  targetPage,
  amazonPage,
  applePage,
  bestBuyPage,
  ebayPage,
  redditPage
);
googlePage.children.push(paypalPage);
googlePage.children.push(netflixPage);
netflixPage.children.push(dropboxPage);
dropboxPage.children.push(targetPage);
amazonPage.children.push(applePage);
amazonPage.children.push(bestBuyPage);

const data = {
  nodes: [],
  links: [],
};

const stack = [rootPage];
const visited = new Set();

while (stack.length > 0) {
  const node = stack.pop();
  if (visited.has(node)) {
    continue;
  }
  visited.add(node);
  data.nodes.push(node);
  node.children.forEach((child) => {
    stack.push(child);
    data.links.push({
      source: node.id,
      target: child.id,
    });
  });
}

console.log(data);

const width = 1400;
const height = 600;

const svg = select("#app")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const linesg = svg.append("g");

const nodesg = svg.append("g");
  
const nodes = nodesg.selectAll("circle")
  .data(data.nodes)
  .enter()
  .append("g");

const links = linesg.selectAll("line")
  .data(data.links)
  .enter()
  .append("line")
  .attr("stroke", "#aaa")
  .attr("class", d => d.source === rootPage.id ? "fromRoot" : null);


const selectNode = (node, id) => {
  if (selectedPages.has(id)) {
    selectedPages.delete(id);
    node.attr("class", "node");
  } else {
    selectedPages.add(id);
    node.attr("class", "node selected");
  }
};

const circles = nodes
  .append("circle")
  .attr("r", 20)
  .attr("class", d => d.name === "root" ? "root" : "node")
  .on("click", function (e, d) {
    selectNode(select(this), d.id);
  })
  .on("contextmenu", function (e, parent) {
    e.preventDefault();
    console.log("contextmenu event");
    select("#app").selectAll(".node").each(function (d) {
      const stack = [parent];
      let found = false;
      while (stack.length > 0) {
        const node = stack.pop();
        if (node.id === d.id) {
          found = true;
          break;
        }
        node.children.forEach(child => {
          stack.push(child);
        });
      }
      if (found) {
        selectNode(select(this), d.id);
      }
    });
  });
  
const texts = nodes
  .append("text")
  .attr("dx", 12)
  .attr("dy", ".35em")
  .text(d => d.name === "root" ? null : d.name)

const force = forceSimulation(data.nodes)
  .force("link", forceLink().id(d => d.id).links(data.links))
  .force("charge", forceManyBody().strength(-2000))
  .force("center", forceCenter(width / 2, height / 2))
  .on("tick", () => {
    links
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    nodes.attr("transform", d => `translate(${d.x}, ${d.y})`);
  });