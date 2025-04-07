<script>
// import VueFlow from "@vue-flow/core";
// import axios from "axios";

// export default {
//   components: { VueFlow },
//   data() {
//     return {
//       diagrams: [],
//       isAdmin: false, // Esto puede ser determinado por el JWT
//     };
//   },
//   created() {
//     this.fetchDiagrams();
//     this.checkIfAdmin();
//   },
//   methods: {
//     async fetchDiagrams() {
//       const response = await axios.get("http://localhost:5000/diagrams");
//       this.diagrams = response.data;
//     },
//     async createDiagram() {
//       const newDiagram = {
//         title: "Nuevo Diagrama",
//         content: [
//         { id: '1', data: { label: 'Inicio' }, position: { x: 250, y: 0 } },
//         { id: '2', data: { label: 'Fin' }, position: { x: 250, y: 150 } }
//         ], // Aquí puedes poner un objeto de diagrama vacío
//       };
//       await axios.post("http://localhost:5000/diagrams", newDiagram, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       });
//       this.fetchDiagrams();
//     },
//     async editDiagram(id) {
//       // Implementa la lógica para editar un diagrama
//     },
//     async deleteDiagram(id) {
//       await axios.delete(`http://localhost:5000/diagrams/${id}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       });
//       this.fetchDiagrams();
//     },
//     checkIfAdmin() {
//       const token = localStorage.getItem("token");
//       if (token) {
//         const decoded = JSON.parse(atob(token.split(".")[1]));
//         if (decoded.role === "admin") {
//           this.isAdmin = true;
//         }
//       }
//     },
//   },
// };
</script>


<template>
  <div>
    <h2>Diagramas</h2>
  </div>
</template>




<style scoped>
</style>
