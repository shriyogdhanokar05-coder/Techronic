package com.yourorg.appname;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yourorg.appname.dto.request.LoginRequest;
import com.yourorg.appname.dto.request.RecordMatchResultRequest;
import com.yourorg.appname.dto.request.RegisterRequest;
import com.yourorg.appname.entity.User;
import com.yourorg.appname.repository.MatchRecordRepository;
import com.yourorg.appname.repository.UserRepository;
import com.yourorg.appname.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TechronicsApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MatchRecordRepository matchRecordRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        matchRecordRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void contextLoads() {
        assertThat(jwtUtil).isNotNull();
        assertThat(userRepository).isNotNull();
        assertThat(matchRecordRepository).isNotNull();
    }

    @Test
    void testJwtGenerationAndValidation() {
        String token = jwtUtil.generateToken("TEST_PILOT");
        assertThat(token).isNotEmpty();
        assertThat(jwtUtil.getUsernameFromToken(token)).isEqualTo("TEST_PILOT");
        assertThat(jwtUtil.validateToken(token)).isTrue();
    }

    @Test
    void testRegisterAndLoginFlow() throws Exception {
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setUsername("NEO_CYBER");
        registerReq.setGamerTag("NEO_CYBER");
        registerReq.setEmail("neo@matrix.io");
        registerReq.setPassword("P@ssword1234");

        // 1. Register
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.gamerTag").value("NEO_CYBER"))
                .andExpect(jsonPath("$.data.token").isNotEmpty());

        // 2. Login
        LoginRequest loginReq = new LoginRequest();
        loginReq.setUsername("NEO_CYBER");
        loginReq.setPassword("P@ssword1234");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.gamerTag").value("NEO_CYBER"))
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).get("data").get("token").asText();
        assertThat(token).isNotEmpty();

        // 3. Access Protected /api/users/me
        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.gamerTag").value("NEO_CYBER"))
                .andExpect(jsonPath("$.data.level").value(1))
                .andExpect(jsonPath("$.data.combatRating").value(1200));
    }

    @Test
    void testRegisterWithOnlyUsernameAndPassword() throws Exception {
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setUsername("MINIMAL_PILOT");
        registerReq.setPassword("Password999!");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.gamerTag").value("MINIMAL_PILOT"))
                .andExpect(jsonPath("$.data.user.email").value("minimal_pilot@techronics.gg"))
                .andExpect(jsonPath("$.data.token").isNotEmpty());
    }

    @Test
    void testMatchQuickResultAndHistory() throws Exception {
        // Create user
        User user = new User();
        user.setUsername("SPECTRE_X");
        user.setGamerTag("SPECTRE_X");
        user.setEmail("spectre@techronics.gg");
        user.setPasswordHash(passwordEncoder.encode("Secret123!"));
        user.setRole("ROLE_USER");
        user.setLevel(5);
        user.setCombatRating(1500);
        userRepository.save(user);

        String token = jwtUtil.generateToken("SPECTRE_X");

        // Submit quick match victory
        RecordMatchResultRequest matchResult = new RecordMatchResultRequest();
        matchResult.setResultType("WIN");
        matchResult.setOpponentTag("NEURAL_AI_V2");
        matchResult.setDurationSeconds(42);
        matchResult.setPlayer1Score(3);
        matchResult.setPlayer2Score(1);
        matchResult.setBoardState("[{\"player\":\"X\",\"index\":4},{\"player\":\"O\",\"index\":0}]");

        mockMvc.perform(post("/api/matches/quick-result")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(matchResult)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.resultType").value("WIN"))
                .andExpect(jsonPath("$.data.crChange").value(24))
                .andExpect(jsonPath("$.data.xpEarned").value(185));

        // Verify history endpoint
        mockMvc.perform(get("/api/matches/history")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());

        // Verify leaderboard endpoint
        mockMvc.perform(get("/api/leaderboard")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify leaderboard podium endpoint
        mockMvc.perform(get("/api/leaderboard/podium")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
