package com.yourorg.appname.config;

import com.yourorg.appname.entity.Quest;
import com.yourorg.appname.entity.User;
import com.yourorg.appname.repository.QuestRepository;
import com.yourorg.appname.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final QuestRepository questRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized with users.");
            return;
        }

        log.info("Seeding initial Techronics Cyber pilots and quest data...");

        User viper = User.builder()
                .username("CYBER_VIPER")
                .email("viper@techronics.gg")
                .passwordHash(passwordEncoder.encode("CyberViper2026!"))
                .gamerTag("CYBER_VIPER")
                .role("ROLE_USER")
                .rankDivision("DIAMOND III")
                .combatRating(2450)
                .level(42)
                .currentXp(8450)
                .victories(342)
                .defeats(118)
                .draws(45)
                .winStreak(7)
                .avatarUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuCSXqdyHnS9BuGphkoQl7oUuxJNABrjK_Pa54SRVoJkBZ826RhOH7NZ4C2f_XfosMQHQ6EP3CPvRzKmdQVcgSsSWoIh9igN4BMQfihmx83lmDdOAIFqkmG9_X-IedcDxX_FsG5PXXuMmsnhIbkbHxEnaTTLBY4w5v6s2HZctqhrzhcBZpykxR6ZbvVh5fChGqlJIvreZhf0LB6wSYlUfj5AtA28tGweQ3ED33jmYzxKEY-cx0Y_kYDweQ")
                .build();

        User ghost = User.builder()
                .username("NEXUS_GHOST")
                .email("ghost@techronics.gg")
                .passwordHash(passwordEncoder.encode("NexusGhost2026!"))
                .gamerTag("NEXUS_GHOST")
                .role("ROLE_USER")
                .rankDivision("APEX PREDATOR")
                .combatRating(3120)
                .level(50)
                .currentXp(12800)
                .victories(512)
                .defeats(89)
                .draws(31)
                .winStreak(14)
                .avatarUrl("https://lh3.googleusercontent.com/aida/AEtjO1XUan5Ffk3FawSQDwTewKBqVm82wK3i_BFHm2D0JQ2Qk8P8_AP1EA3sITSuUr-MmD_Himw6Zi6r_OMSZXFYAB4HnMPVNX-ifE6XEJBUuImUfyBtLGebM6CtapuI8h7FW1Ad5142n-T16Vx6BesBdBgM-KsSM59b1_4SR4PHZWh2mmIXOfITshoScXSphP64N4rTr0AO1F65x9T9fVInh5MbxVnvCu8hIoenKlD6PJDGJF1RxHvRgr2G6k4P")
                .build();

        User valkyrie = User.builder()
                .username("VALKYRIE_01")
                .email("valk@techronics.gg")
                .passwordHash(passwordEncoder.encode("Valkyrie2026!"))
                .gamerTag("VALKYRIE_01")
                .role("ROLE_USER")
                .rankDivision("PLATINUM I")
                .combatRating(1980)
                .level(36)
                .currentXp(6200)
                .victories(210)
                .defeats(95)
                .draws(22)
                .winStreak(4)
                .avatarUrl("https://lh3.googleusercontent.com/aida/AB6AXuCSXqdyHnS9BuGphkoQl7oUuxJNABrjK_Pa54SRVoJkBZ826RhOH7NZ4C2f_XfosMQHQ6EP3CPvRzKmdQVcgSsSWoIh9igN4BMQfihmx83lmDdOAIFqkmG9_X-IedcDxX_FsG5PXXuMmsnhIbkbHxEnaTTLBY4w5v6s2HZctqhrzhcBZpykxR6ZbvVh5fChGqlJIvreZhf0LB6wSYlUfj5AtA28tGweQ3ED33jmYzxKEY-cx0Y_kYDweQ")
                .build();

        User chrono = User.builder()
                .username("CHRONO_KID")
                .email("chrono@techronics.gg")
                .passwordHash(passwordEncoder.encode("ChronoKid2026!"))
                .gamerTag("CHRONO_KID")
                .role("ROLE_USER")
                .rankDivision("GOLD II")
                .combatRating(1540)
                .level(24)
                .currentXp(3400)
                .victories(134)
                .defeats(88)
                .draws(19)
                .winStreak(2)
                .build();

        User voidRunner = User.builder()
                .username("VOID_RUNNER")
                .email("void@techronics.gg")
                .passwordHash(passwordEncoder.encode("VoidRunner2026!"))
                .gamerTag("VOID_RUNNER")
                .role("ROLE_USER")
                .rankDivision("SILVER I")
                .combatRating(1280)
                .level(18)
                .currentXp(1850)
                .victories(85)
                .defeats(72)
                .draws(14)
                .winStreak(1)
                .build();

        userRepository.saveAll(List.of(viper, ghost, valkyrie, chrono, voidRunner));

        if (questRepository.count() == 0) {
            Quest q1 = Quest.builder()
                    .title("Win 3 Ranked Encounters")
                    .description("Achieve victory in 3 competitive matches across any active sector.")
                    .rewardXp(250)
                    .targetCount(3)
                    .currentCount(2)
                    .completed(false)
                    .resetTime("14:32:10")
                    .build();

            Quest q2 = Quest.builder()
                    .title("Execute 5 Diagonal Clears")
                    .description("Score a 3-in-a-row alignment through center diagonal vectors.")
                    .rewardXp(150)
                    .targetCount(5)
                    .currentCount(5)
                    .completed(true)
                    .resetTime("14:32:10")
                    .build();

            Quest q3 = Quest.builder()
                    .title("Defeat Neural CyberNet AI")
                    .description("Out-calculate the EXPERT / CYBER_NET difficulty minimax bot.")
                    .rewardXp(400)
                    .targetCount(1)
                    .currentCount(0)
                    .completed(false)
                    .resetTime("14:32:10")
                    .build();

            questRepository.saveAll(List.of(q1, q2, q3));
        }

        log.info("Techronics data initialization complete.");
    }
}
